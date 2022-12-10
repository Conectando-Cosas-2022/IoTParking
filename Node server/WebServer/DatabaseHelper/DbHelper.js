const Usuario = require("../Model/User");


class DbHelper{

    constructor(){
        this.sql = require("mssql");

        let config = {
            user: "AdminIot",
            password: "iotparking",
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

    getEndDate(startdate,duration){
        let dateClone = new Date(startdate.getTime());
        dateClone.setMinutes(dateClone.getMinutes() + duration);
        return dateClone;
    }

    async nextResLessThanOneHour(spot){
        /*Agarra todas las reservas que tiene ese spot
          para cada una se fija si el tiempo de reserva menos el momento actual es positivo
            se fija si la diferencia es menos que una hora
            si si retorna true
          Sino encuentra ninguno
            retorna false


        */  let nowDate = new Date();
            let reservations = await this.sql.query`select * from Reservas where Lugar = ${spot}`;
            for(let i = 0; i < reservations.recordset.length;i++){
                let resDate = reservations[i].Fecha_Reserva;

                if(nowdate - resDate > 0){
                    let minDif = (nowDate - resDate)/60000;

                    if(minDif <= 60){
                        return true;
                    }

                }
            }

            return false;
    }

    async activeReservationExists(spot){
        let nowDate = new Date();
        let reservations = await this.sql.query`select * from Reservas where Lugar = ${spot}`;
        for(let i = 0; i < reservations.recordset.length;i++){
            let startDate = reservations[i].Fecha_Reserva;
            let duration = reservations[i].Duracion;

            let endDate = this.getEndDate(startDate,duration);

            if(startDate - nowDate > 0 && nowDate - endDate > 0){
                return true;
            }
            
        }
        return false;
    }
      
    async tieneReservaMatricula(matricula){
        let reservas = await this.sql.query`select * from Reservas inner join Matriculas on Matriculas.ID_Matricula = Reservas.ID_Matricula where Matricula = ${matricula}`;
        let fechaActual = new Date();
        for(let unaReserva of reservas.recordset){
            let diferencia = unaReserva.Fecha_Reserva - fechaActual;
            console.log(diferencia);
        }
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

    async getReservationList(){
        try{
        let date = await this.sql.query`select Fecha_Reserva,Duracion from Reservas inner join Matriculas on Reservas.ID_Reserva=Matriculas.ID_Reservas`;
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