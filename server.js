const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");
const mysql = require("mysql2");
const querystring = require("querystring");
const express = require("express");
const session = require("express-session");
const crypto = require("crypto");


const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hardi@sql8705",
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

// MIME type mapping
const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const app = express(); // Create an Express app
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/index", express.static(path.join(__dirname, "index")));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
// app.use("/Database(image)", express.static(path.join(__dirname, "Database(image)")));
// app.use("/", routes);
app.use(session({
  secret: 'your_secret_key', // Change this to a secure secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set 'true' if using HTTPS
}));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "index.html"));
});
app.get(
  [
    "/plants",
    "/bouquets",
    "/pots",
    "/fertilizers",
    "/tools",
    "/plants/seasonal_plants",
    "/plants/suitable_locations",
    "/plants/plant_types",
    "/plants/flower_varieties",
    "/bouquets/occassion_type",
    "/bouquets/wrapping_style",
    "/bouquets/arrangement_type",
    "/bouquets/flower_varieties",
  ],
  (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "shop.html"));
  }
);

app.get(
  [
    "/seasonal_plants/summer",
    "/seasonal_plants/winter",
    "/seasonal_plants/monsoon",
    "/seasonal_plants/spring",
    "/seasonal_plants/autumn",
    "/seasonal_plants/all-seasons",
    "/suitable_locations/indoor",
    "/suitable_locations/outdoor",
    "/suitable_locations/office",
    "/suitable_locations/balcony",
    "/suitable_locations/bedroom",
    "/suitable_locations/terrace",
    "/suitable_locations/living-room",
    "/plant_types/air-plants",
    "/plant_types/bamboo",
    "/plant_types/climber",
    "/plant_types/creeper",
    "/plant_types/cactus",
    "/plant_types/herb",
    "/plant_types/shrubs",
    "/flower_varieties/rose",
    "/flower_varieties/adenium",
    "/flower_varieties/lily",
    "/flower_varieties/hibiscus",
    "/flower_varieties/jasmine",
    "/flower_varieties/marigold",
    "/flower_varieties/carnation",
    "/occassion/birthday",
    "/occassion/anniversary",
    "/occassion/congratulations",
    "/occassion/get-well-soon",
    "/occassion/farewell",
    "/occassion/condolences",
    "/wrapping-style/flowers-in-a-box",
    "/wrapping-style/flowers-in-vase",
    "/wrapping-style/ribbon-wrapped",
    "/wrapping-style/flower-basket",
    "/wrapping-style/cellophane-wrapped",
    "/wrapping-style/tissue-wrapped",
    "/arrangement-type/heart-shape",
    "/arrangement-type/flower-basket",
    "/arrangement-type/flower-in-glass",
    "/arrangement-type/hand-bouquet",
    "/flower-varieties/rose-bouquet",
    "/flower-varieties/carnations-bouquet",
    "/flower-varieties/lily-bouquet",
    "/flower-varieties/mixed-flowers-bouquet",
    "/pots/plastic",
    "/pots/ceramic",
    "/pots/glass",
    "/pots/resin",
    "/pots/vase",
    "/pots/hanging-pots",
    "/fertilizers/organic",
    "/fertilizers/potting-soil",
    "/fertilizers/cocopeat",
    "/fertilizers/manure",
    "/fertilizers/compost",
  ],
  (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "shopsub.html"));
  }
);

const indexRouter = require("./routes/indexrouter");
app.use("/", indexRouter);

const header = require("./routes/headrouter");
app.use("/header", header);

// Product detail router
const prodetail = require("./routes/proddetailrouter");
app.use(
  "/product",
  (req, res, next) => {
    next();
  },
  prodetail
);

// User management router
const user = require("./routes/userrouter");
app.use(
  "/user",
  (req, res, next) => {
    next();
  },
  user
);

// Cart management
const cart = require("./routes/cartrouter");
app.use(
  "/cart",
  (req, res, next) => {
    next();
  },
  cart
);

// Order management
const order = require("./routes/order router");
app.use(
  "/orders",
  (req, res, next) => {
    next();
  },
  order
);

// Search product
const search = require("./routes/searchprodrouter");
app.use(
  "/",
  (req, res, next) => {
    next();
  },
  search
);

// Wishlist
const wishlist = require("./routes/wishlistrouter");
app.use(
  "/wishlist",
  (req, res, next) => {
    next();
  },
  wishlist
);

// Feedback
const feedback = require("./routes/reviewrouter");
app.use(
  "/feedback",
  (req, res, next) => {
    next();
  },
  feedback
);

app.get("/index/plants", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "shop.html"));
});

app.get("/header", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "header.html"));
});

app.get("/footer", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "footer.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
