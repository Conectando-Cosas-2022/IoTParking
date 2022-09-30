
    //User requests
    loginRequest(req){
        var dbHelper = new dbHelper();
        let user =  dbHelper.AuthenticateUser(user,pass);
        
        if(user.id != -1){
            authenticatedResponse(req);
        }else{

            badRequestResponse(req);
        }

    }

    authenticatedResponse(req){


    }

    getNotificationsRequest(req){
        var user = GetUser(req);
        var notifHandler = new NotificationHandler();
        var notif = notifHandler.getNotifications(user);

        //Aca se deberia devolver la respuesta
    }

    notifyRequest(){
        var notifier = getNotifier(req);
        notifier.notify();
        
    }

    //Se deberia responder
    badRequestResponse(req){


    }

