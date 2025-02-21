// routes/headrouter.js
const express = require("express");
const router = express.Router();
const {
  getCategoryData,
  getSubCategoryData,
  queries,
  subCategoryQueries,
  bouquetSubCategoryQueries,
  potsSubCategoryQueries,
  fertilizersSubCategoryQueries,
  plantsdata,
  bouquetdata,
  potsdata,
  fertilizerdata,
  toolsdata,
} = require("../controllers/headController");

router.get("/plantsdata", plantsdata);
router.get("/bouquetdata", bouquetdata);
router.get("/potsdata", potsdata);
router.get("/fertilizerdata", fertilizerdata);
router.get("/toolsdata", toolsdata);
// Define routes dynamically based on queries
router.get("/categorydata", getCategoryData(queries.categorydata));
router.get("/seasonal_plants", getCategoryData(queries.seasonal_plants));
router.get("/suitable_locations", getCategoryData(queries.suitable_locations));
router.get("/plant_types", getCategoryData(queries.plant_types));
router.get("/flowering_plant", getCategoryData(queries.flowering_plant));

// Bouquet-related routes
router.get("/occassion_type", getCategoryData(queries.occasion_type));
router.get("/wrapping_style", getCategoryData(queries.wrapping_style));
router.get("/arrangement_style", getCategoryData(queries.arrangement_style));
router.get("/flower_varieties", getCategoryData(queries.flower_varieties));

// Gardening-related routes
router.get("/plant_containers", getCategoryData(queries.plant_containers));
router.get("/soil_nutrients", getCategoryData(queries.soil_nutrients));
router.get("/gardening_tools", getCategoryData(queries.gardening_tools));

router.get("/season/:subCategory", (req, res) => {
  const subCategoryKey = `season/${req.params.subCategory.toLowerCase()}`;
  const [query, countQuery] = subCategoryQueries[subCategoryKey] || [];
  if (query && countQuery) {
    getSubCategoryData(query, countQuery)(req, res);
  } else {
    res.status(404).send("Subcategory not found");
  }
});

router.get("/suitable_locations/:subCategory", (req, res) => {
  const subCategoryKey = `location/${req.params.subCategory.toLowerCase()}`;
  const [query, countQuery] = subCategoryQueries[subCategoryKey] || [];
  if (query && countQuery) {
    getSubCategoryData(query, countQuery)(req, res);
  } else {
    res.status(404).send("Subcategory not found");
  }
});

router.get("/plant_types/:subCategory", (req, res) => {
  const subCategoryKey = `type/${req.params.subCategory.toLowerCase()}`;
  const [query, countQuery] = subCategoryQueries[subCategoryKey] || [];
  if (query && countQuery) {
    getSubCategoryData(query, countQuery)(req, res);
  } else {
    res.status(404).send("Subcategory not found");
  }
});

router.get("/flower_varieties/:subCategory", (req, res) => {
  const subCategoryKey = `flowering/${req.params.subCategory.toLowerCase()}`;
  const [query, countQuery] = subCategoryQueries[subCategoryKey] || [];
  if (query && countQuery) {
    getSubCategoryData(query, countQuery)(req, res);
  } else {
    res.status(404).send("Subcategory not found");
  }
});

// Subcategory routes for bouquets
router.get("/bouquet/occassion/:subCategory", (req, res) => {
  const subCategoryKey = `occassion/${req.params.subCategory
    .toLowerCase()
    .replace(/ /g, "-")}`;
  const [query, countQuery] = bouquetSubCategoryQueries[subCategoryKey] || [];
  if (query && countQuery) {
    getSubCategoryData(query, countQuery)(req, res);
  } else {
    res.status(404).send("Subcategory not found");
  }
});

router.get("/bouquet/wrapping/:subCategory", (req, res) => {
  const subCategoryKey = `wrapping/${req.params.subCategory
    .toLowerCase()
    .replace(/ /g, "-")}`;
  const [query, countQuery] = bouquetSubCategoryQueries[subCategoryKey] || [];
  if (query && countQuery) {
    getSubCategoryData(query, countQuery)(req, res);
  } else {
    res.status(404).send("Subcategory not found");
  }
});

router.get("/bouquet/type/:subCategory", (req, res) => {
  const subCategoryKey = `type/${req.params.subCategory
    .toLowerCase()
    .replace(/ /g, "-")}`;
  const [query, countQuery] = bouquetSubCategoryQueries[subCategoryKey] || [];
  if (query && countQuery) {
    getSubCategoryData(query, countQuery)(req, res);
  } else {
    res.status(404).send("Subcategory not found");
  }
});

router.get("/bouquet/flowers/:subCategory", (req, res) => {
  const subCategoryKey = `flowers/${req.params.subCategory
    .toLowerCase()
    .replace(/ /g, "-")}`;
  const [query, countQuery] = bouquetSubCategoryQueries[subCategoryKey] || [];
  if (query && countQuery) {
    getSubCategoryData(query, countQuery)(req, res);
  } else {
    res.status(404).send("Subcategory not found");
  }
});
router.get("/pots/type/:subCategory", (req, res) => {
  const subCategoryKey = `type/${req.params.subCategory
    .toLowerCase()
    .replace(/ /g, "-")}`;
  const [query, countQuery] = potsSubCategoryQueries[subCategoryKey] || [];
  if (query && countQuery) {
    getSubCategoryData(query, countQuery)(req, res);
  } else {
    res.status(404).send("Subcategory not found");
  }
});

// Subcategory routes for fertilizers
router.get("/fertilizers/type/:subCategory", (req, res) => {
  const subCategoryKey = `type/${req.params.subCategory
    .toLowerCase()
    .replace(/ /g, "-")}`;
  const [query, countQuery] =
    fertilizersSubCategoryQueries[subCategoryKey] || [];
  if (query && countQuery) {
    getSubCategoryData(query, countQuery)(req, res);
  } else {
    res.status(404).send("Subcategory not found");
  }
});

module.exports = router;
