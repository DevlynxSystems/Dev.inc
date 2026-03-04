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

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})
