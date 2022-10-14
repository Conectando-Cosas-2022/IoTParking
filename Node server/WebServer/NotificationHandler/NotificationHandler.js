class NotificationHelper{
    constructor(){
        this.dbHelper = new DatabaseHelper();

    }

    addUserNotification(user){
       
        let query = "";
        this.dbHelper.Execute(query);
    }

    notificationRead(user,notificationID){
        let query = "";
        this.dbHelper.Execute(query);

    }

    getNotifications(user){
        let query = "";
        var notifications = this.dbHelper.Execute(query);
        return notifications;
    }


}