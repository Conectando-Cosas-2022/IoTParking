class DbHelper{

    constructor(){
        this.sql = require("mssql");

        let config = {
            user: "Admin",
            password: "proyecto2!server",
            server: "20.226.31.138",
            database: "Iotparking"
        };

        this.sql.connect(config,(err)=>{
            console.log(err);
        });
    }

    async userExists(username){
        let users = await this.sql.query`select * from Usuarios where Nombre = ${username}`;
        if(users.recordsets.length > 0){
            return true;
        }else{
            return false;
        }
    }

    async addUser(username,password){
        try{
            await this.sql.query`ìnsert into Usuarios (Nombre,Password) VALUES (${username},${password})`;
            
        }catch(ex){
            throw ex;
        }
    }



}

module.exports = DbHelper;