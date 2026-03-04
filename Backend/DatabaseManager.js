
const mongoose = require("mongoose");



class DatabaseManager{
    

    constructor(){
       this.connection = null 
    }

    async connect(uri){
        console.log(uri)
        if(this.connection){
            return this.connection
        }
        try{
            this.connection = await mongoose.connect(uri);
            console.log("Connection to database is initialized");
            return this.connection;
        }catch(error){
            console.error(`Connection to database failed to initialize ${error}`);
            process.exit(1);
        }
    }

    async disconnect(){
        await mongoose.disconnect();
        console.log("Disconnected from database");
    }



}

const dbInstance = new DatabaseManager();
module.exports = dbInstance