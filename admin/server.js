const mysql = require("mysql2");
const path = require("path");
const bodyParser = require('body-parser');
const express = require("express");
const cors = require('cors');

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
    console.log("Connected to MySQL database");
});

const app = express(); // Create an Express app
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/index", express.static(path.join(__dirname, "index")));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static('public/uploads'));
app.use('/images', express.static(__dirname + '/images'));


// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "public", "html", "index.html"));
// });
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/index.html');
});
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
