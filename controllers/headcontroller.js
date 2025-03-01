const mysql = require("mysql");
const dynamicController = require("./dynamiccontroller");
const sendfileController = require("./filecontroller");

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hetalsql@1405",
  database: "main_project",
});

// db.connect((err) => {
//   if (err) {
//     console.error("Error connecting to database:", err);
//     return;
//   }
//   console.log("Connected to database");
// });

const fetchData = (category, subcategory, res, app) => {
  let query = "";
  if (subcategory) {
    query = `
      SELECT ss_id, ss_name, ss_image
      FROM SubSubcategory 
      WHERE sub_id = (SELECT sub_id FROM Subcategory WHERE sub_name = ? AND cy_id = (SELECT cy_id FROM CATEGORY WHERE CY_NAME = ?))
    `;
    db.query(query, [subcategory, category], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Error executing query" });
        return;
      }
      results.forEach((row) => {
        const subSubcategoryEndpoint = `/${subcategory
          .toLowerCase()
          .replace(/ /g, "_")}/${row.ss_name.toLowerCase().replace(/ /g, "_")}`;
        dynamicController(app)(
          subSubcategoryEndpoint,
          sendfileController.sendShopSub
        ); // Create dynamic route for subsubcategory
      });
      res.json({ items: results });
    });
  } else {
    query = `
      SELECT sub_id, sub_name, sub_image
      FROM Subcategory 
      WHERE cy_id = (SELECT cy_id FROM CATEGORY WHERE CY_NAME = ?)
    `;
    db.query(query, [category], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Error executing query" });
        return;
      }
      res.json({ items: results });
    });
  }
};

const getCategoryData = (app) => {
  return (req, res) => {
    const category = req.params.category;
    const subcategory = req.params.subcategory || null;
    fetchData(category, subcategory, res, app);
  };
};

const getCategories = (app) => {
  return (req, res) => {
    db.query("SELECT * FROM category", (err, results) => {
      if (err) {
        console.error("Error fetching categories:", err);
        res.status(500).send("Error fetching categories");
        return;
      }
      results.forEach((row) => {
        const categoryEndpoint = `/${row.CY_NAME.toLowerCase().replace(
          / /g,
          "_"
        )}`;
        dynamicController(app)(categoryEndpoint, sendfileController.sendShop); // Create dynamic route for category
      });
      res.json(results);
    });
  };
};

const getHeaderCategories = (app) => {
  const dynamicController = require("./dynamiccontroller")(app);

  return (req, res) => {
    const categoriesQuery = `
      SELECT c.CY_ID, c.CY_NAME, s.sub_id, s.sub_name 
      FROM category c
      LEFT JOIN subcategory s ON c.CY_ID = s.cy_id
    `;

    db.query(categoriesQuery, (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        res.status(500).json({ error: "Error executing query" });
        return;
      }

      const categories = {};

      results.forEach((row) => {
        if (!categories[row.CY_NAME]) {
          categories[row.CY_NAME] = {
            title: row.CY_NAME,
            links: [],
          };

          const categoryEndpoint = `/${row.CY_NAME.toLowerCase().replace(
            / /g,
            "_"
          )}`;
          dynamicController(categoryEndpoint, sendfileController.sendShop); // Create dynamic route for category
        }

        if (row.sub_name) {
          const subcategoryEndpoint = `/${row.CY_NAME.toLowerCase().replace(
            / /g,
            "_"
          )}/${row.sub_name.toLowerCase().replace(/ /g, "_")}`;
          dynamicController(subcategoryEndpoint, sendfileController.sendShop); // Create dynamic route for subcategory

          categories[row.CY_NAME].links.push({
            name: row.sub_name,
            url: subcategoryEndpoint,
          });
        }
      });
      const formattedCategories = Object.values(categories);
      res.json(formattedCategories);
    });
  };
};

const getSubCategoryData = (app) => {
  const dynamicController = require("./dynamiccontroller")(app);

  return (req, res) => {
    const { category, subCategory } = req.params;

    const query = `
      SELECT ss_id, ss_name, ss_image
      FROM SubSubcategory 
      WHERE sub_id = (SELECT sub_id FROM Subcategory WHERE sub_name = ? AND cy_id = (SELECT cy_id FROM CATEGORY WHERE CY_NAME = ?))
    `;
    db.query(query, [subCategory, category], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Error executing query" });
        return;
      }

      results.forEach((row) => {
        const subSubcategoryEndpoint = `/${subCategory
          .toLowerCase()
          .replace(/ /g, "_")}/${row.ss_name.toLowerCase().replace(/ /g, "_")}`;
        dynamicController(
          subSubcategoryEndpoint,
          sendfileController.sendShopSub
        ); // Create dynamic route for subsubcategory
      });
      res.json({ items: results });
    });
  };
};

const getSubSubCategoryData = (req, res) => {
  const { subcategory, subsubcategory } = req.params;

  getCategoryName(subcategory, (categoryName) => {
    if (!categoryName) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    
    const sql = `SELECT ss_desc as description FROM subsubcategory WHERE ss_name = ?`;
    db.query(sql, [subsubcategory], (err, result) => {
      if (err) {
        console.error("Error executing description query:", err);
        res.status(500).json({ error: "Error executing description query" });
        return;
      }
      const desc = result.length > 0 ? result[0].description : null;

      const query = `
        SELECT id, name, price, PATH1 as image
        FROM ${categoryName}
        JOIN image ON ${categoryName}.id = image.product_id
        WHERE ${subcategory} LIKE ?
      `;

      db.query(query, [`%${subsubcategory}%`], (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          res.status(500).json({ error: "Error executing query" });
          return;
        }
        results.map((result) => {
          result.image = result.image.toString();
        });
        res.json({ items: results, description: desc });
      });
    });
  });
};


const getCategoryName = (subcategory, callback) => {
  const subcategoryQuery = `
    SELECT cy_id 
    FROM Subcategory 
    WHERE sub_name = ?
  `;

  db.query(subcategoryQuery, [subcategory], (err, subResults) => {
    if (err || subResults.length === 0) {
      console.error("Error executing subcategory query:", err);
      callback(null);
      return;
    }

    const categoryId = subResults[0].cy_id;

    const categoryQuery = `
      SELECT cy_name 
      FROM Category 
      WHERE cy_id = ?
    `;

    db.query(categoryQuery, [categoryId], (err, catResults) => {
      if (err || catResults.length === 0) {
        console.error("Error executing category query:", err);
        callback(null);
        return;
      }

      const categoryName = catResults[0].cy_name;
      callback(categoryName);
    });
  });
};

module.exports = {
  getCategoryData,
  getCategories,
  getHeaderCategories,
  getSubCategoryData,
  getSubSubCategoryData,
};
