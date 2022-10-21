
const express = require('express')
const tessereact = require("tesseract.js");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const sqlClient = require("mssql");
const cookieParser = require("cookie-parser");

const app = express()
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
  
  res.sendFile(path.join(__dirname,'WebServer/Views/RegisterPlatePage.html'));
});

app.post('/registerUser',(req,res)=>{
  /*
   *
   Se obtiene el nombre de usuario
   Se obtiene la contraseña

   Si no existe un usuario con ese nombre
    se ingresa
  Sino
    Se envia un response code de error
   */



});

app.post('/loginUser',(req,res)=>{
  /*
    Se obtiene el nombre de usuario
    Se obtiene la contraseña,

    Se intenta ingresar
    Si se ingresa
      Se guarda una cookie con una clave que identifica el usuario (el userID)
    Sino 
      Se envia el response code de error
  */
});

app.post("/savePlate",(req,res)=>{
  /**
   * 
   Se obtiene el UserID apartir de la cookie
    Si tiene la cookie
      Agarro la matricula
      Si no esta ingresada
        la ingreso
      Sino
        mando error en response
    Sino
      Se manda login.html

   * 
   */

});

app.post("/saveReservation",(req,res)=>{
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