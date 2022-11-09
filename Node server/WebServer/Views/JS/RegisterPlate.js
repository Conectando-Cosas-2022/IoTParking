async function registerPlateClick(){
    var plate = document.getElementById("cajaTextoRegistroPlate").value;
        if(!(plate.trim() == "")){
        let response = await savePlatePost(plate);

        let data = await response.json();
        alert(data.msg);
        
        if(data.error && data.redirect != ""){
            window.location.href = data.redirect;
        }
    
        }else{
            alert("Debe ingresar una matrícula");
            
        }
    
   
}


async function savePlatePost(plate){


        request = {
            plateNumber: plate,
        };

    const response = await fetch("savePlate", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },

        body:JSON.stringify(request)

    });

    

    return response;

}