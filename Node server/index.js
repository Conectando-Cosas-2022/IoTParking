
const express = require('express')
const tessereact = require("tesseract.js");
const fs = require("fs");
const app = express()
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
    var file = fs.readFile("./a.png",(err,data)=>{
        tessereact.recognize(data).then((textData)=>{
        console.log(` ${str} - ${textData.data.text}`);

    })
    


    })
    res.send('<H1>Hola Carlos!</H1>');

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})