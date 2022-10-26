class DbHelper{

    constructor(){
        this.sql = require("mssql");

        let config = {
            user: "AdminUser",
            password: "admin",
            server: "localhost",
            database: "Iotparking",
            port:1433,
	   options:{
		trustServerCertificate: true
	    }
        };

        this.sql.connect(config,(err)=>{
            console.log(err);
        });
    }

    async userExists(username){
        let users = await this.sql.query`select * from Usuarios where Nombre = ${username}`;
        if(users.recordset.length > 0){
            return true;
        }else{
            return false;
        }
    }

    async addUser(username,password){
        try{
            await this.sql.query`INSERT INTO [dbo].[Usuarios] (Nombre,Password) values (${username},${password})`;
            
        }catch(ex){
            console.log(ex);
            throw ex;
        }
    }



}

module.exports = DbHelper;