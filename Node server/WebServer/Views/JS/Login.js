async function loginClick(){
    var user = document.getElementById("TxtName").value;
    var pass = document.getElementById("TxtPassword").value;

        let response = await loginPost(user,pass);

        let data = await response.json();
            alert(data.msg);

            if(data.redirect != ""){
                window.location.href = data.redirect;
            }
    
   
}


async function loginPost(user, pass){


        request = {
            username: user,
            password: pass
        };

    const response = await fetch("loginUser", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        body:JSON.stringify(request)

    });

    

    return response;

}