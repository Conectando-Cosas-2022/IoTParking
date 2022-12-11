

async function DebugSwitch() {
    let matricula = document.getElementById("idmatricula").value;
    let enabled = document.getElementById("idenabled").checked;

    request = {
        plate: matricula,
        isEnabled: enabled
    };

    const response = await fetch("debugSwitch", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)

    });

}