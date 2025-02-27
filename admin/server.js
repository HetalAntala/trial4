const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = "your_secret_key"; 

// ✅ Database Connection
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Hetalsql@1405",
    database: "main_project",
});

con.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("✅ Connected to MySQL database");
});

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));  
app.use(express.static(path.join(__dirname, "public", "html"))); 

app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true } // Ensure cookies can be cleared
  }));
  


app.get("/", (req, res) => {
    if (!req.session.registered) {
        res.sendFile(path.join(__dirname,"public", "html", "register.html"));
    } else {
        res.sendFile(path.join(__dirname,"public", "html", "login.html"));
    }
});

// ✅ Import and use authentication routes
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);
// Route Import
const customerRoutes = require('./routes/customerRoutes');
app.use('/customers', customerRoutes);

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/category', categoryRoutes);

const orderdetRoutes = require('./routes/orderdetRoutes');
app.use('/order', orderdetRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/product', productRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
