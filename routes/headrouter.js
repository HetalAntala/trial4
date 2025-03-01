const express = require('express');
const {
  getCategoryData,
  getCategories,
  getHeaderCategories,
  getSubCategoryData,
  getSubSubCategoryData,
} = require('../controllers/headcontroller');

module.exports = (app) => {
  const router = express.Router();

  // Fetch categories and dynamically create routes
  router.get("/fetch/fetchcategories", (req, res) => getCategories(app)(req, res));
   
  // Header routes
  router.get("/menu/categories", (req, res) => getHeaderCategories(app)(req, res));
  router.get("/header/:category", (req, res) => getCategoryData(app)(req, res));
  router.get("/:category/:subCategory", (req, res) => getSubCategoryData(app)(req, res));
  router.get("/sub/:subcategory/:subsubcategory", getSubSubCategoryData);
  
  // Dynamic data fetching based on category

  return router;
};
