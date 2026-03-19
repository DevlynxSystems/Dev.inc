
const mongoose = require("mongoose");
const Book = require('./BooksClass');



class DatabaseManager{
    

    constructor(){
       this.connection = null 
    }

    bookSchema = new mongoose.Schema({
        title: { type: String, required: [true, "Title is required"] },
        author: { type: String, required: [true, "Author is required"] },
        cover: { type: String }, 
        pageCount: { type: Number, required: [true, "Page count is required"], default: 0 }, 
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
        const title = bookData.title != null ? String(bookData.title).trim() : "";
        const author = bookData.author != null ? String(bookData.author).trim() : "";
        const cover = bookData.cover != null ? bookData.cover : null;
        const date = bookData.date != null ? (typeof bookData.date === "string" ? bookData.date : new Date(bookData.date)) : new Date();
        const pageCount = typeof bookData.pageCount === "number" && !Number.isNaN(bookData.pageCount)
            ? bookData.pageCount
            : parseInt(bookData.pageCount, 10) || 0;

        const book = new Book(title, date, author, cover, pageCount);
        return await book.insertIntoDatabase(this);
    }

    async updateBook(id, bookData) {
        const update = {};
        if (bookData.title != null) update.title = String(bookData.title).trim();
        if (bookData.author != null) update.author = String(bookData.author).trim();
        if (bookData.cover !== undefined) update.cover = bookData.cover;
        if (bookData.pageCount != null) update.pageCount = typeof bookData.pageCount === "number" ? bookData.pageCount : parseInt(bookData.pageCount, 10) || 0;
        if (bookData.date != null) update.date = typeof bookData.date === "string" ? bookData.date : new Date(bookData.date);
        const updated = await this.BookModel.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
        if (!updated) throw new Error("Book not found");
        return updated;
    }

    async deleteBook(id) {
        try {
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

    async getBookById(id) {
        try {
            if (!id) return null;
            return await this.BookModel.findById(id);
        } catch (error) {
            console.error("Error fetching book by id:", error);
            return null;
        }
    }

}

const dbInstance = new DatabaseManager();
module.exports = dbInstance