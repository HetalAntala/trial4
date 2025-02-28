const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');
const bodyParser = require("body-parser");
const session = require("express-session");



const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(cors({ origin: 'http://localhost:8000', credentials: true }));


app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false} // Cookie expires in 24 hours
}));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Hetalsql@1405",
    database: "main_project"
});
db.connect((err) => {
    if (err) {
        console.error("Database connection error:", err);
        return;
    }
    console.log("Connected to MySQL database");
});

app.get("/", (req, res) => {
    if (!req.session.registered) {
        res.sendFile(path.join(__dirname,"public", "html", "register.html"));
    } else {
        res.sendFile(path.join(__dirname,"public", "html", "login.html"));
    }
});

const deliveryRoutes = require("./routes/droutes");
app.use("/delivery", deliveryRoutes);

app.listen(8000, () => {
    console.log("Server running on port 8000");
});
