//Import necessary files and dependencies

const express = require("express");
const cors = require("cors");
require("dotenv").config()
const app = express();
app.use(
    cors({
        origin: true,
        allowedHeaders: ["Content-Type", "Authorization"],
    })
)
// Allow larger payloads for base64 cover images (default is 100kb)
app.use(express.json({ limit: "10mb" }))

const dataBaseManager = require("./DatabaseManager");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.get("/", (req, res) =>{
    res.send("Database is up and running");
})

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
const mongoUri =
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devinc_book_catalog';

if (!process.env.MONGO_URI) {
    console.warn(
        'Warning: Backend/.env is missing MONGO_URI. Falling back to local MongoDB:'
    );
    console.warn(`  ${mongoUri}`);
}

async function start() {
    try {
        await dataBaseManager.connect(mongoUri);
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

