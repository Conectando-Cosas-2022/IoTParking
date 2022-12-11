let list = null;
let currentSelectedValue = null;


function loaded(){
    let btnList = 
        [document.getElementById("idBtnReserva1"),
        document.getElementById("idBtnReserva2"),
        document.getElementById("idBtnReserva3"),
        document.getElementById("idBtnReserva4")];

    let datepicker = document.getElementById("idFecha");
    datepicker.min = new Date().toISOString().split("T")[0];
    list = btnList;
}

function reserveBtn(event){
   for(let i=0;i<=3;i++){
    list[i].style.backgroundColor='#9b9b9b';
   }

    list[event.value-1].style.backgroundColor='#ccc8c8';
    currentSelectedValue = event.value-1;
}

async function saveReservationRequest(){
    let startDate = document.getElementById("idFecha").value;
    console.log("La startdate es:");
    console.log(startDate);
    console.log("La starthour es:");
    let startHour = document.getElementById("idHora").value;
    let resDuration = document.getElementById("idDuracion").value;
    let mat = document.getElementById("idMat").value;
    console.log(startHour);
    let parsedDate = startDate +" "+startHour;
    console.log(new Date(parsedDate));

    request = {
        plateNumber: mat,
        date: parsedDate,
        duration: resDuration,
        spot:currentSelectedValue + 1
    };

const response = await fetch("saveReservation", {
    method: "POST",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    body:JSON.stringify(request)

});
alert(response.msg);

if(response.redirect != ""){
    window.location.href = response.redirect;
}
}

async function reserveClick(){
    await saveReservationRequest();
}



