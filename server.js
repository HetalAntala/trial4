const path = require("path");
const mysql = require("mysql2");
const express = require("express");
const app = express(); // Create an Express app
const session = require("express-session");
const sendfileController = require("./controllers/filecontroller");
const dynamicController = require("./controllers/dynamiccontroller")(app);
const combinedRouter = require("./routes/headrouter")(app);

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hetalsql@1405",
  database: "main_project",
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

const PORT = process.env.PORT || 4000;

app.use(cors({ origin: 'http://localhost:3000' })); // Allow admin server to access
app.use('/images', express.static('images'));

app.use(express.json());
app.use("/index", express.static(path.join(__dirname, "index")));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "your_secret_key", // Change this to a secure secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set 'true' if using HTTPS
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "index.html"));
});

app.get("/forgot", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "forgot.html"));
});

const indexRouter = require("./routes/indexrouter");
app.use("/", indexRouter);

app.use("/header", combinedRouter);

dynamicController("/files/:filename", sendfileController.sendShop);

app.get("/api/categories", (req, res) => getCategories(req, res)); // Pass app instance

// Product detail router
const prodetail = require("./routes/proddetailrouter");
app.use("/product", prodetail);
app.get("/product.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "productdetail.html"));
});

// User management router
const user = require("./routes/userrouter");
app.use("/user", user);
app.get("/user/reset-password", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "resetpassword.html"));
});

// Cart management
const cart = require("./routes/cartrouter");
app.use("/cart", cart);
app.get("/cart.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "cart.html"));
});
app.get("/checkout.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "checkout.html"));
});

// Order management
const order = require("./routes/order router");
app.use("/order", order);
app.get("/payment.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "payment.html"));
});
app.get("/orderPlaced.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "orderPlaced.html"));
});

// Payment router
const paymentRouter = require("./routes/paymentrouter");
app.use("/payment", paymentRouter);

// Search product
const search = require("./routes/searchprodrouter");
app.use("/search", search);

// Wishlist
const wishlist = require("./routes/wishlistrouter");
app.use("/wishlist", wishlist);
app.get("/wishlist.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "wishlist.html"));
});

const fetchrouter = require("./routes/fetchrouter");
app.use("/fetch", fetchrouter);
// Feedback
const feedback = require("./routes/reviewrouter");
app.use("/feedback", feedback);

app.get("/contactus.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "contactus.html"));
});
app.get("/privacy.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "privacy.html"));
});
app.get("/index/plants", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "shop.html"));
});

app.get("/header", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "header.html"));
});

app.get("/footer", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "footer.html"));
});
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "login.html"));
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
