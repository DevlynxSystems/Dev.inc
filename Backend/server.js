//Import necessary files and dependencies

const express = require("express");
const cors = require("cors");
require("dotenv").config()
const app = express();
app.use(cors())
app.use(express.json())

const dataBaseManager = require("./DatabaseManager");
dataBaseManager.connect(process.env.MONGO_URI)

app.get("/", (req, res) =>{
    res.send("Database is up and running");
})

app.get("/api/books", async (req, res) => {
    try {
        const books = await dataBaseManager.getAllBooks();
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch books" });
    }
});

app.post("/api/books", async (req, res) => {
    try {
        // req.body contains the bookData object sent from React
        const savedBook = await dataBaseManager.addBook(req.body);
        res.status(201).json(savedBook);
    } catch (err) {
        res.status(400).json({ error: "Failed to add book" });
    }
});

app.delete("/api/books/:id", async (req, res) => {
    try {
        await dataBaseManager.deleteBook(req.params.id);
        res.status(200).json({ message: "Book deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete book" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})


dataBaseManager.addBook("Big bad wolf", Date(), "joe mama", null, 50);

