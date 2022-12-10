
const express = require('express')
const tessereact = require("tesseract.js");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
let DbHelper = require("./WebServer/DatabaseHelper/DbHelper");
const os = require("os");
let sqlHelper = new DbHelper();
let availableSpots = [true,true,true,true];

const formData = require("express-form-data");


const cookieParser = require("cookie-parser");
const { json } = require('body-parser');
const { send } = require('process');

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text({type:"*/*",limit:"30000kb"}));


app.use(express.urlencoded({extended: true}));
app.use(express.static('WebServer/Views'));

let port = 80;

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
    
    sqlHelper.tieneReservaMatricula("ABC1234");
    

    res.sendFile(path.join(__dirname,'WebServer/Views/LoginPage.html'));

});

function cleanData(data){
  let splitData = data.split(" ");
  for(let split in splitData){
      if(split.length()>=3 && isValidPlateString(split)){
        return split;
      }
  }
}

function isValidPlateString(split){
  var regEx = /[ `!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?~]/;
  return !regEx.test(split);
}

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

});

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
};

function sendLoginPage(res){
  res.send({
    error:true,
    msg:"Error",
    redirect: "/"
  })
}

app.get("/photoUploaded",async (req,res)=>{
  
  console.log(` ${str} - Nueva request`);
    
    var file = fs.readFile("../a.jpg",(err,data)=>{

        tessereact.recognize(data).then((textData)=>{
          //var clean = cleanData(textData.text);
        console.log(` ${str} - ${textData.data.text}`);
        
    });
  
  });
    res.send("test");
  
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
      

      let plate = req.params.plateNumber;
      let date = new Date(req.params.date);
      var oldres = sqlHelper.getReservationList(plate);



      if(!reservationExists(plate,parsedDate,duration)){
        
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

function getEndDate(startdate,duration){
  let dateClone = new Date(startdate.getTime());
  dateClone.setMinutes(dateClone.getMinutes() + duration);
  return dateClone;
}

function dateRangeOverlaps(a_start, a_end, b_start, b_end) {
  if (a_start <= b_start && b_start <= a_end) return true; // b starts in a
  if (a_start <= b_end   && b_end   <= a_end) return true; // b ends in a
  if (b_start <  a_start && a_end   <  b_end) return true; // a in b
  return false;
}

function reservationExists(startdate,duration,reservationsRecordset){
  let newenddate = getEndDate(startdate,duration);

  for(let reservation in reservationsRecordset){
    let oldstartdate = reservation.Fecha_Reserva;
    let oldenddate = getEndDate(reservation.Fecha_Reserva,reservation.Duracion);
    if(dateRangeOverlaps(startdate,newenddate,oldstartdate,oldenddate)){
      return true;
    }
  }
  return false;
}

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

function obtenerLugarDisponible(matricula){
/*
  llamamos funcion que verifica si la matricula ya tiene una reserva
  si tiene
    lo guardo en lista de clientes que estan dentro del estacionamiento
    devuelvo el numero de lugar de la reserva
  no tiene
    recorre la lista de lugares y se fija cual esta disponible y además tiene una 
    diferencia de por lo menos una hora con la siguiente reserva en dicho lugar
    encuentra un lugar
    guarda matricula en la lista de clientes dentro estacionamiento
    devuelvo lugar
  |
*/
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});