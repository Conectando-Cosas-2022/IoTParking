const Usuario = require("../Model/User");


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

    async loginUser(username,password){
        let user = await this.sql.query`select * from Usuarios where Nombre = ${username} and Password = ${password}`;
        if(user.recordset.length > 0){
            return true;
        }else{
            return false;
        }

    }

    async getUser(username,password){
        let user = await this.sql.query`select * from Usuarios where Nombre = ${username}`;
        if(user.recordset.length > 0){
            return new Usuario(
                user.recordset[0].ID,
                user.recordset[0].Nombre,
                user.recordset[0].Password);
        }else{
            return null;
        }
    }

    async plateExists(plateNumber){
        let plate = await this.sql.query`select * from Matriculas where Matricula = ${plateNumber}`;
        if(plate.recordset.length > 0){
            return true;
        }else{
            return false;
        }
    }

    async addPlate(userID,plateNumber){
        try{
            await this.sql.query`INSERT INTO [dbo].[Matriculas] (Matricula,ID_Usuario) values (${plateNumber},${userID})`;
            
        }catch(ex){
            console.log(ex);
            throw ex;
        }


    }

    async getReservationList(plateNumber){
        try{
        let date = await this.sql.query`select Fecha_Reserva,Duracion from Reservas inner join Matriculas on Reservas.ID_Reserva=Matriculas.ID_Reservas where Matriculas.Matricula = ${plateNumber}`;
            return date.recordset;
        }catch(ex){
            console.log(ex);
            throw ex;
        }
    }

    async addReservation(plateNumber,reservationDate,duration){
        try{
                await this.sql.query`INSERT INTO [dbo].[Reservas] (ID_Matricula,Fecha_Reserva,Duracion) values (${plateNumber},${reservationDate},${duration})`;
            }catch(ex){
                console.log(ex);
                throw ex;
            }
    }

   


}

module.exports = DbHelper;