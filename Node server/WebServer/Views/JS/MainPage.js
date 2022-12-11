
async function windowLoaded(){
    let userElement = document.getElementById("idUsername");
    let user = getCookie("UserName");

    userElement.innerHTML = user;

}

function registroMatriculaRedirect(){
    window.location.href = "registerplate";
}

function lugarAsignadoRedirect(){
    window.location.href = "notifications";
}

//https://stackoverflow.com/questions/10730362/get-cookie-by-name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }