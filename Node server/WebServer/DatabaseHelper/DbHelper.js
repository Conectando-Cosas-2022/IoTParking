const Usuario = require("../Model/User");


class DbHelper{

    constructor(){
        this.sql = require("mssql");

        let config = {
            user: "AdminIot",
            password: "adminIot",
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
            let resrecordset = reservations.recordset;
            for(let i = 0; i < reservations.recordset.length;i++){
                let resDate = resrecordset[i].Fecha_Reserva;
                resDate.setMinutes(resDate.getMinutes()+180);

                if(resDate - nowDate > 0){
                    let minDif = (resDate - nowDate)/60000;

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
        let resrecordset = reservations.recordset;
        for(let i = 0; i < reservations.recordset.length;i++){
            let startDate = resrecordset[i].Fecha_Reserva;
            startDate.setMinutes(startDate.getMinutes()+180);
            let duration = resrecordset[i].Duracion;
            let endDate = this.getEndDate(startDate,duration);

            if(startDate - nowDate < 0 && endDate - nowDate > 0){
                return true;
            }
            
        }
        return false;
    }
      
    async tieneReservaMatricula(matricula){
        //Terminar...
        let reservas = await this.sql.query`select * from Reservas inner join Matriculas on Matriculas.ID_Matricula = Reservas.ID_Matricula where Matricula = ${matricula}`;
        let currentDate = new Date();
        for(let i = 0; i < reservas.recordset.length;i++){
            let unaReserva = reservas.recordset[i];
            let startDate = unaReserva.Fecha_Reserva;
            startDate.setMinutes(startDate.getMinutes()+180);
            let endDate = this.getEndDate(startDate,unaReserva.Duracion);
            let firstDif = startDate - currentDate;
            let endDif = endDate - currentDate;
            if(firstDif < 0 && endDif > 0){
                return {
                    hasReservation:true,
                    spot:unaReserva.Lugar
                }
            }

        }

        return {hasReservation:false,
        spot:-1};
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

    async getUser(username){
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


    async getUserIdFromPlate(plate){
        let userset = await this.sql.query`select ID_Usuario from Matriculas where Matricula = ${plate}`;
        return userset.recordset[0].ID_Usuario;
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

    async getReservationsList(spot){
        try{
        let date = await this.sql.query`select Fecha_Reserva,Duracion from Reservas where Lugar = ${spot}`;
            return date.recordset;
        }catch(ex){
            console.log(ex);
            throw ex;
        }
    }

    async addReservation(plateNumber,reservationDate,duration,spot){
        try{
                reservationDate.setMinutes(reservationDate.getMinutes() - 180);
                await this.sql.query`INSERT INTO Reservas (ID_Matricula,Fecha_Reserva,Duracion,Lugar) values ((select ID_Matricula from Matriculas where Matricula = ${plateNumber}),${reservationDate},${duration},${spot})`;
            }catch(ex){
                console.log(ex);
                
                throw ex;
            }
    }

   


}

module.exports = DbHelper;