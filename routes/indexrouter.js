const express = require("express");
const router = express.Router();
const indexcontroller = require("../controllers/indexcontroller");

router.get("/best-selling", indexcontroller.bs);  // ✅ Fetch Best-Selling Products
router.get("/fresh-arrivals", indexcontroller.fa); // ✅ Fetch Fresh Arrivals

module.exports = router;
