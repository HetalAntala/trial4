const express = require("express");
const productController = require("../controllers/searchprodcontroller");
const router = express.Router();

router.get("/search", productController.searchProducts);

module.exports = router;
