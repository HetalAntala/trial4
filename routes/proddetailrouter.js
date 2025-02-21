const express = require("express");
const router = express.Router();
const { getProductDetails } = require("../controllers/proddetailcontroller");

// Route for product detail page
router.get("/:name", getProductDetails);

module.exports = router;
