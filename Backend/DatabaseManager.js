
const mongoose = require("mongoose");
const Book = require('./BooksClass');



class DatabaseManager{
    

    constructor(){
       this.connection = null 
    }

    bookSchema = new mongoose.Schema({
        title: { type: String, required: true },
        author: { type: String, required: true },
        cover: { type: Buffer }, 
        pageCount: { type: Number, required: true }, 
        date: { type: Date, default: Date.now }
    });
    BookModel = mongoose.model("Book", this.bookSchema);
    
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


    addBook(Title, date, Author, Cover, PageCount){
        const book = new Book(Title, date, Author, Cover, PageCount)
        book.insertIntoDatabase(this)
    }

    async deleteBook(id){
        await db.deleteOne({ _id: ObjectId(String(id))});
    }

}

const dbInstance = new DatabaseManager();
module.exports = dbInstance