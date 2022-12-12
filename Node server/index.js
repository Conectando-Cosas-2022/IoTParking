
const express = require('express')
const tessereact = require("tesseract.js");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
let DbHelper = require("./WebServer/DatabaseHelper/DbHelper");
const os = require("os");
let sqlHelper = new DbHelper();
let availableSpots = [true, true, true, true];
let activePlates = [];
let notificationsPopupPollingData = []; 
let debugPlate = "";
let debugEnabled = false;

const formData = require("express-form-data");


const cookieParser = require("cookie-parser");
const { json, text } = require('body-parser');
const { send } = require('process');

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text({ type: "*/*", limit: "30000kb" }));


app.use(express.urlencoded({ extended: true }));
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
  let str = minutes + "-" + seconds;


  console.log(` ${str} - Nueva request`);



  res.sendFile(path.join(__dirname, 'WebServer/Views/LoginPage.html'));

});

function cleanData(data) {
  let dataparse = data.replace("\n","");
  let splitData = dataparse.split(" ");
  for (let i = 0;i < splitData.length ; i++) {
    let valid =  isValidPlateString(splitData[i])
    if (splitData[i].length >= 3 && valid) {
      return splitData[i];
    }
  }
  return " ";
}

function isValidPlateString(split) {
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
  let str = minutes + "-" + seconds;


  console.log(` ${str} - Nueva request`);

  res.sendFile(path.join(__dirname, 'WebServer/Views/RegisterPage.html'));

});

app.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname, 'WebServer/Views/MainPage.html'));
});



app.get('/notifications', (req, res) => {
  res.sendFile(path.join(__dirname, 'WebServer/Views/NotificationsPage.html'));
});

app.get('/registerplate', (req, res) => {
  if (req.cookies.UserID) {
    res.sendFile(path.join(__dirname, 'WebServer/Views/RegisterPlatePage.html'));
  } else {
    res.sendFile(path.join(__dirname, 'WebServer/Views/LoginPage.html'));
  }
});

function sendRegisterPage(res) {
  res.sendFile(path.join(__dirname, 'WebServer/Views/RegisterPage.html'));
};

function sendLoginPage(res) {
  res.send({
    error: true,
    msg: "Error",
    redirect: "/"
  })
}

//DEBUG//
app.post("/getActivePlates",(req,res)=>{
  res.send(activePlates);
});

app.post("/debugSwitch",(req,res)=>{
    let platetocheck = req.body.plate;
    let isen = req.body.isEnabled;

    debugPlate = platetocheck;
    debugEnabled = isen;

    res.send(`${debugPlate} - ${debugEnabled}`);
})

app.post("/userHasActivePlates",async (req,res)=>{
  let userIDtoCheck = req.body.userId;
  let sent = false;
  for(let plate of activePlates){
    let userId = await sqlHelper.getUserIdFromPlate(plate.matric);
    if(userIDtoCheck == userId){
      sent = true;
      res.send(
        {
        plate:plate.matric,
        spot:plate.lugar,
        isActive:true
      });
      break;
    
    }
  }
  if(!sent){
    res.send({isActive:false});
  }


});
app.get("/photoUploaded", async (req, res) => {



  try {
    let plate = debugPlate;
    if(!debugEnabled){
      var file = fs.readFileSync("a.jpg");
      let textData = await tessereact.recognize(file);
      plate = cleanData(textData.data.text);
    }

    console.log(plate);
    if (sqlHelper.plateExists(plate)) {
      let spot = await obtenerLugarDisponible(plate);
      res.send({
        availableSpot: spot
      });
    }


  } catch (e) {
    throw e;
  }



});





app.post('/registerUser', async (req, res) => {
  /*
   *
   Se obtiene el nombre de usuario
   Se obtiene la contraseña

   Si no existe un usuario con ese nombre
    se ingresa
  Sino
    Se envia un response code de error
   */
  console.log("REQUEST: " + JSON.stringify(req.body));
  let username = req.body.username;
  let password = req.body.password;
  console.log("username es:" + username);
  let exists = await sqlHelper.userExists(username);

  if (!exists) {
    await sqlHelper.addUser(username, password);

    res.send({
      error: false,
      msg: "Usuario creado!",
      redirect: ""
    });

  } else {
    res.send({
      error: true,
      msg: "Ya existe un usuario con ese nombre",
      redirect: ""
    });


  }



});

app.post('/loginUser', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let exists = await sqlHelper.userExists(username);
  if (!exists) {
    res.send({
      error: true,
      msg: "No existe un usuario con ese nombre",
      redirect: ""
    });

  } else {
    if (await sqlHelper.loginUser(username, password)) {
      let user = await sqlHelper.getUser(username);
      res.cookie('UserID', user.ID, { maxAge: 900000, httpOnly: false });
      res.cookie('UserName', user.Nombre, { maxAge: 900000, httpOnly: false });

      res.send({
        error: false,
        msg: "Logeado con exito",
        redirect: "/main"
      });

    } else {

      res.send({
        error: true,
        msg: "Contraseña incorrecta",
        redirect: ""
      });

    }


  }
});

app.post("/savePlate", async (req, res) => {

  var userID = req.cookies.UserID;
  if (userID != null) {
    var plateNumber = req.body.plateNumber;
    if (!(await sqlHelper.plateExists(plateNumber))) {
      await sqlHelper.addPlate(userID, plateNumber);

      res.send({
        error: false,
        msg: "Matricula ingresada con exito",
        redirect: ""
      })

    } else {
      res.send({
        error: true,
        msg: "Esa matricula ya fue ingresada",
        redirect: ""
      });

    }


  } else {
    sendLoginPage(res);
  }

});

app.post("/getActivePlate",async (req,res)=>{
  /*Agarrlo la lista de los active, para cada uno me fijo el id de usuario,
  si es igual al del request cookie entonces le retorno esa matricula*/
  let userid = req.cookies.UserID;
  if(userid != null){

    for(let activeSpot of availableSpots){
      let plateuserId = await sqlHelper.getUserIdFromPlate(activeSpot.matric);
        if(plateuserId == userid){
          res.send({
            error:false,
            matricula:activeSpot.matric,
            lugar:activeSpot.lugar
          });

        }
    }

    res.send({
      error:true,
      msg:"El usuario no tiene matriculas activas",
      redirect:"/"
    });


  }else{
    res.send({
      error:true,
      mesg:"consulta de matricula activa sin logeo",
      redirect:"/"
    })
  }
});

app.post("/subirBarrera",(req,res)=>{
  let spot = req.body.spot;
  let upAction = true;

  notificationsPopupPollingData.push({lugar: spot, arriba:upAction});
  res.send("success");
});

app.post("/bajarBarrera",(req,res)=>{
  let spot = req.body.spot;
  let upAction = false;
  notificationsPopupPollingData.push({lugar: spot, arriba:upAction});
  res.send("success");
});

app.get("/esp8266pollingdata",(req,res)=>{
  res.send(notificationsPopupPollingData);
});

app.post("/actionComplete",(req,res)=>{
  let spotdata = req.body.spot;
  notificationsPopupPollingData = notificationsPopupPollingData
  .filter(polldata => polldata.lugar != spotdata);
  res.send("success");
});

app.get("/reservas",(req,res)=>{
  let userID = req.cookies.UserID;
  if (userID != null) {
    res.sendFile(path.join(__dirname, 'WebServer/Views/ReservationsPage.html'));
  }else{
    sendLoginPage(res);
  }
});

app.post("/saveReservation", async (req, res) => {
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
  if (userID != null) {


    let plate = req.body.plateNumber;
    let date = new Date(req.body.date);
    let duration = req.body.duration;
    let spot = req.body.spot;

    let reservations = await sqlHelper.getReservationsList(spot);
    
    if (!reservationExists(date,duration,reservations)) {

      await sqlHelper.addReservation(plate, date,duration,spot);
      res.send({
        error: true,
        msg: "Reserva creada con éxito",
        redirect: ""
      })
    } else {

      res.send({
        error: true,
        msg: `Ya existe una reserva en ese periodo para el lugar ${spot}`,
        redirect: ""
      });
    }


  } else {
    sendLoginPage(res);
  }



});

function getEndDate(startdate, duration) {
  let dateClone = new Date(startdate.getTime());
  dateClone.setMinutes(dateClone.getMinutes() + duration);
  return dateClone;
}

function dateRangeOverlaps(a_start, a_end, b_start, b_end) {
  if (a_start <= b_start && b_start <= a_end) return true; // b starts in a
  if (a_start <= b_end && b_end <= a_end) return true; // b ends in a
  if (b_start < a_start && a_end < b_end) return true; // a in b
  return false;
}

function reservationExists(startdate, duration, reservationsRecordset) {
  let newenddate = getEndDate(startdate, duration);

  for (let i=0;i< reservationsRecordset.length; i++) {
    let reservation = reservationsRecordset[i];
    let oldstartdate = reservation.Fecha_Reserva;
    oldstartdate.setMinutes(oldstartdate.getMinutes() + 180);

    let oldenddate = getEndDate(oldstartdate, reservation.Duracion);
    if (dateRangeOverlaps(startdate, newenddate, oldstartdate, oldenddate)) {
      return true;
    }
  }
  return false;
}

app.get("/registeredPlates", (req, res) => {
  /*
    Te fijas lo del login (sino mando a pagina de login)
      Obtenes el id de usuario
      Mandas las matriculas con ese ID de usuario
  
  */


});

app.get("/registeredReservations", (req, res) => {
  /*
    Te fijas si esta logeado (sino mando login)
      Obtengo la hora
      en la base de datos, hay que revisar todas las reservas que se den dentro de ese periodo de tiempo
      las mando
  */
});


async function obtenerLugarDisponible(matricula) {
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
    */

  let resData = await sqlHelper.tieneReservaMatricula(matricula)
  if (resData.hasReservation) {
    if(resData.spot != -1){
      activePlates.push({matric: matricula, lugar: spot});
      availableSpots[spot-1] = false;
      return resData.spot;
    }

  } else {

    let avspot = await getAvailableSpot();
    if(avspot != -1){
      activePlates.push({matric: matricula, lugar: avspot});
      availableSpots[avspot-1] = false;
      return avspot;
    }

  }



}

async function getAvailableSpot() {
  /*
    Recorre la lista de lugares libres
    obtiene la proxima reserva mas cercana para el proximo lugar
    Si la diferencia es mas que una hora que el momento actual y no esta adentro de una reserva
    devuelvo el lugar,

    si me quedo sin lugares retorno -1
  */

  for (let j = 0; j < 4; j++) {
    if (availableSpots[j]) {
      if (!(await sqlHelper.nextResLessThanOneHour(j+1)) && !(await sqlHelper.activeReservationExists(j+1))) {
        return j+1;
      }
    }
  }
  return -1;
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});