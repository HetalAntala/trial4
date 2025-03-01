const express = require("express");

const {
  fetchDataCat,
  fetchDataSubCat,
  fetchFilters,
  filterData,
} = require("../controllers/fetchcontroller");
const router = express.Router();

router.get("/:category", fetchDataCat);
router.get("/sub/:category/:subcategory", fetchDataSubCat);
router.get("/sort/:category", fetchFilters);
router.get("/:category/filter", filterData);

module.exports = router;
