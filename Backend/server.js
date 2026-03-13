//Import necessary files and dependencies

const express = require("express");
const cors = require("cors");
require("dotenv").config()
const app = express();
app.use(cors())
// Allow larger payloads for base64 cover images (default is 100kb)
app.use(express.json({ limit: "10mb" }))

const dataBaseManager = require("./DatabaseManager");

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
        const savedBook = await dataBaseManager.addBook(req.body);
        res.status(201).json(savedBook);
    } catch (err) {
        let message = "Failed to add book";
        if (err.name === "ValidationError" && err.errors) {
            message = Object.values(err.errors)
                .map((e) => e.message)
                .join("; ");
        } else if (err.message) {
            message = err.message;
        }
        console.error("POST /api/books error:", message, err);
        res.status(400).json({ error: message });
    }
});

app.put("/api/books/:id", async (req, res) => {
    try {
        const updated = await dataBaseManager.updateBook(req.params.id, req.body);
        res.json(updated);
    } catch (err) {
        let message = "Failed to update book";
        if (err.name === "ValidationError" && err.errors) {
            message = Object.values(err.errors).map((e) => e.message).join("; ");
        } else if (err.message) message = err.message;
        console.error("PUT /api/books/:id error:", message, err);
        res.status(err.message === "Book not found" ? 404 : 400).json({ error: message });
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

async function start() {
    try {
        await dataBaseManager.connect(process.env.MONGO_URI);
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err.message);
        process.exit(1);
    }
}

start();


//dataBaseManager.addBook("Big bad wolf", Date(), "joe mama", null, 50);

