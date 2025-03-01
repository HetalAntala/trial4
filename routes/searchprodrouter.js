const express = require("express");
const productController = require("../controllers/searchprodcontroller");
const router = express.Router();

// Route to handle product search
router.get("/searchProducts", productController.searchProducts);

// Route to fetch related keywords
router.get("/searchKeywords", productController.searchKeywords);

module.exports = router;
