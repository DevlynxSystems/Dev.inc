
const mongoose = require("mongoose");
const Book = require('./BooksClass');



class DatabaseManager{
    

    constructor(){
       this.connection = null 
    }

    bookSchema = new mongoose.Schema({
        title: { type: String, required: true },
        author: { type: String, required: true },
        cover: { type: String }, 
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


    // addBook(Title, date, Author, Cover, PageCount){
    //     const book = new Book(Title, date, Author, Cover, PageCount)
    //     book.insertIntoDatabase(this)
    // }
    // DatabaseManager.js

    async addBook(bookData) {
        // 1. Destructure the data coming from req.body
        const { title, date, author, cover, pageCount } = bookData;

        // 2. Pass them individually into the Book constructor
        // Note: The order here must match your constructor in BooksClass.js
        const book = new Book(title, date, author, cover, pageCount);

        // 3. Save and return the saved document
        return await book.insertIntoDatabase(this);
    }

    async deleteBook(id) {
        try {
            // Use this.BookModel (the model you initialized in the constructor)
            return await this.BookModel.findByIdAndDelete(id);
        } catch (error) {
            console.error("Error deleting book from database:", error);
            throw error;
        }
    }

    async getAllBooks() {
        try {
            return await this.BookModel.find({});
        } catch (error) {
            console.error("Error fetching books:", error);
            return [];
        }
    }

}

const dbInstance = new DatabaseManager();
module.exports = dbInstance