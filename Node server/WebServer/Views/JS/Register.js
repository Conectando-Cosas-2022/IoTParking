


async function registerClick(){
    var user = document.getElementById("idNombre").value;
    var pass = document.getElementById("idContraseña").value;
    var confirmedPass = document.getElementById("idConfirmarContraseña").value;

    if(pass == confirmedPass){
        let response = await registerPost(user,pass);

        let data = await response.json();
            alert(data.msg);

            if(data.redirect != ""){
                window.location.href = data.redirect;
            }
    
    }else{
        alert("Las contraseñas no son iguales");
    }
}


async function registerPost(user, pass){


        request = {
            username: user,
            password: pass
        };

    const response = await fetch("registerUser", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        body:JSON.stringify(request)

    });

    

    return response;

}