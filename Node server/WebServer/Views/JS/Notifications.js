var globalSpot = 0;
async function windowLoaded() {
    let usrId = getCookie("UserID");
    let activeResponse = await serverHasActivePlates(usrId);
    let data = await activeResponse.json();
    if (data.isActive) {
        let elementMatricula = document.getElementById("idNumMatricula");
        let elementLugar = document.getElementById("idNumLugar");
        elementMatricula.innerHTML = `Matrícula: ${data.plate}`;
        elementLugar.innerHTML = `Lugar: ${data.spot}`;
        globalSpot = data.spot;
    } else {
        alert("Todavia no cuentas con un lugar asignado");
        window.location.href = "/main";
    }


}

async function subirBarreraReq() {
    request = {
        spot: globalSpot
    };

    const response = await fetch("subirBarrera", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)

    });

    alert("La barrera se subirá");

}

async function bajarBarreraReq() {
    request = {
        spot: globalSpot
    };

    const response = await fetch("bajarBarrera", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)

    });

    alert("La barrera se bajará");
}

function mainRedirect() {
    window.location.href = "/main";
}

async function serverHasActivePlates(userid) {
    request = {
        userId: userid
    };

    const response = await fetch("userHasActivePlates", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)

    });





    return response;
}

//https://stackoverflow.com/questions/10730362/get-cookie-by-name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}