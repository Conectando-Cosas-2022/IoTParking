
const express = require('express')
const tessereact = require("tesseract.js");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
let DbHelper = require("./WebServer/DatabaseHelper/DbHelper");
const os = require("os");
let sqlHelper = new DbHelper();


const formData = require("express-form-data");


const cookieParser = require("cookie-parser");
const { json } = require('body-parser');

const app = express()
//app.use(cookieParser());
//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());
app.use(bodyParser.text({type:"*/*",limit:"100kb"}));


app.use(express.urlencoded({extended: true}));
app.use(express.static('WebServer/Views'))

const port = 80

app.get('/', (req, res) => {
    let ts = Date.now();

    
    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    let str = minutes+"-"+seconds ;
    

    console.log(` ${str} - Nueva request`);
    /*
    var file = fs.readFile("./a.png",(err,data)=>{
        tessereact.recognize(data).then((textData)=>{
        console.log(` ${str} - ${textData.data.text}`);

    })
    
    


    })
    */

    res.sendFile(path.join(__dirname,'WebServer/Views/LoginPage.html'));

})

app.get('/Register', (req, res) => {
  let ts = Date.now();
  let date_ob = new Date(ts);
  let date = date_ob.getDate();
  let month = date_ob.getMonth() + 1;
  let year = date_ob.getFullYear();
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  let str = minutes+"-"+seconds ;
  

  console.log(` ${str} - Nueva request`);

  res.sendFile(path.join(__dirname,'WebServer/Views/RegisterPage.html'));

})

app.get('/main',(req,res)=>{
    res.sendFile(path.join(__dirname,'WebServer/Views/MainPage.html'));
});

app.get('/notifications',(req,res)=>{
  res.sendFile(path.join(__dirname,'WebServer/Views/NotificationsPage.html'));
});

app.get('/registerplate',(req,res)=>{
  if(req.cookies.UserID){
    res.sendFile(path.join(__dirname,'WebServer/Views/RegisterPlatePage.html'));
  }else{
    res.sendFile(path.join(__dirname,'WebServer/Views/LoginPage.html'));
  }
});

function sendRegisterPage(res){
  res.sendFile(path.join(__dirname,'WebServer/Views/RegisterPage.html'));
}

function sendLoginPage(res){
  res.send({
    error:true,
    msg:"Error",
    redirect: "/"
  })
}

app.post("/uploads",async (req,res)=>{
  //console.log(req);
  var request = req.body;
  console.log(request);
  database64 = request;
  console.log("Data es "+database64) ;
  let buffer = Buffer.from(database64,'base64');
  fs.createWriteStream("./a.jpg").write(buffer);
  var data = await fs.promises.readFile("./a.jpg");

  let textData = await tessereact.recognize(data);
    console.log(` ${str} - ${textData.data.text}`);
    res.send(textData.data.text);
    

});

app.post('/registerUser', async (req,res)=>{
  /*
   *
   Se obtiene el nombre de usuario
   Se obtiene la contraseña

   Si no existe un usuario con ese nombre
    se ingresa
  Sino
    Se envia un response code de error
   */
  console.log("REQUEST: "+JSON.stringify(req.body));
  let username = req.body.username;
  let password = req.body.password;
  console.log("username es:"+username);
  let exists = await sqlHelper.userExists(username);

  if(!exists){
      await sqlHelper.addUser(username,password);

      res.send({
        error:false,
        msg: "Usuario creado!",
        redirect:""
      });

  }else{
    res.send({
      error: true,
      msg: "Ya existe un usuario con ese nombre",
      redirect:""
    });

    
  }



});

app.post('/loginUser', async (req,res)=>{
      let username = req.body.username;
      let password = req.body.password;
      let exists = await sqlHelper.userExists(username);
  if(!exists){
      res.send({
        error:true,
        msg: "No existe un usuario con ese nombre",
        redirect:""
      });

  }else{
    if(await sqlHelper.loginUser(username,password)){
        let user = await sqlHelper.getUser(username);
        res.cookie('UserID',user.ID, { maxAge: 900000, httpOnly: true });
        res.cookie('UserName',user.Nombre, { maxAge: 900000, httpOnly: true });
        
        res.send({
          error:false,
          msg:"Logeado con exito",
          redirect:""
        });

    }else{
      
      res.send({
        error:true,
        msg:"Contraseña incorrecta",
        redirect:""
      });

    }

    
  }
});

app.post("/savePlate",async (req,res)=>{

      var userID = req.cookies.UserID;
      if(userID != null){
          var plateNumber = req.body.plateNumber;
          if(!(await sqlHelper.plateExists(plateNumber))){
            await sqlHelper.addPlate(userID,plateNumber);
            
            res.send({
              error:false,
              msg:"Matricula ingresada con exito",
              redirect:""
            })

          }else{
            res.send({
              error:true,
              msg:"Esa matricula ya fue ingresada",
              redirect:""
            });

          }


      }else{
        sendLoginPage(res);
      }

});

app.post("/saveReservation",async (req,res)=>{
  /**
   * 
   Se obtiene el UserID apartir de la cookie
    Si tiene la cookie
        Agarro la hora
        Agarro la matricula
        creo la reserva
      Si no esta ingresada la reserva
        la ingreso
      Sino
        mando error en response
    Sino
      Se manda login.html

   * 
   */
    let userID = req.cookies.UserID;
    if(userID != null){
      var day = req.params.day;
      var month = req.params.month;
      var year = req.params.year;
      var time = req.params.time;

      let plate = req.params.plateNumber;

      var parsedDate = sqlHelper.parseDate(day,month,year,time);
      //Revisar reservas que se solapen

      if(!sqlHelper.reservationExists(plate,parsedDate)){
        
        sqlHelper.addReservation(plate,parsedDate);


      }else{

        res.send({
          error:true,
          msg: "Ya existe una reserva en ese periodo",
          redirect:""
        })
      }


    }else{
      sendLoginPage(res);
    }



});

app.get("/registeredPlates",(req,res)=>{
  /*
    Te fijas lo del login (sino mando a pagina de login)
      Obtenes el id de usuario
      Mandas las matriculas con ese ID de usuario
  
  */

      
});

app.get("/registeredReservations",(req,res)=>{
  /*
    Te fijas si esta logeado (sino mando login)
      Obtengo la hora
      en la base de datos, hay que revisar todas las reservas que se den dentro de ese periodo de tiempo
      las mando
  */
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});