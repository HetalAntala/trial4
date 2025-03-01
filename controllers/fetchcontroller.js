const mysql = require("mysql");

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hetalsql@1405",
  database: "main_project",
});

const fetchDataCat = (req, res) => {
  const category = req.params.category;

  const productQuery = `
    SELECT 
      main_table.id, 
      main_table.name, 
      main_table.price, 
      main_table.category_id, 
      IMAGE.PATH1 AS img 
    FROM 
      ?? AS main_table 
    INNER JOIN 
      IMAGE ON main_table.id = IMAGE.product_id
  `;

  const categoryQuery = `SELECT DISTINCT category_id FROM ??`;

  // Execute categoryQuery first to get cy_id
  db.query(categoryQuery, [category], (err, result) => {
    if (err) {
      console.error("Error executing category query:", err);
      res.status(500).json({ error: "Error executing category query" });
      return;
    }

    const cy_id = result[0].category_id;

    const descQuery = `
      SELECT 
        CY_DESC AS des 
      FROM 
        Category 
      WHERE 
        CY_ID = ?
      LIMIT 1
    `;

    // Execute descQuery to get the description
    db.query(descQuery, [cy_id], (err, descResult) => {
      if (err) {
        console.error("Error executing desc query:", err);
        res.status(500).json({ error: "Error executing desc query" });
        return;
      }

      const desc = descResult[0]?.des || "";

      // Execute productQuery to get the products
      db.query(productQuery, [category], (err, productResults) => {
        if (err) {
          console.error("Error executing product query:", err);
          res.status(500).json({ error: "Error executing product query" });
          return;
        }

        // Convert the img field to a string for each result
        const formattedProducts = productResults.map((item) => ({
          ...item,
          img: String(item.img),
        }));

        // Structure the response to include desc once and products as a list
        const response = {
          desc,
          products: formattedProducts,
        };

        res.json(response);
      });
    });
  });
};

const fetchDataSubCat = (req, res) => {
  const { category, subcategory } = req.params;

  // First, get sub_id from the subcategory table
  const subCategoryQuery = `
    SELECT sub_id 
    FROM subcategory 
    WHERE sub_name = ? AND cy_id = (SELECT CY_ID FROM category WHERE CY_NAME = ?)
  `;

  db.query(subCategoryQuery, [subcategory, category], (err, subResult) => {
    if (err) {
      console.error("Error executing subcategory query:", err);
      res.status(500).json({ error: "Error executing subcategory query" });
      return;
    }

    if (subResult.length === 0) {
      res.status(404).json({ error: "Subcategory not found" });
      return;
    }

    const sub_id = subResult[0].sub_id;

    // Next, check if sub_id is present in the subsubcategory table
    const subSubCategoryQuery = `
      SELECT ss_id, ss_desc AS des 
      FROM subsubcategory 
      WHERE sub_id = ?
    `;

    db.query(subSubCategoryQuery, [sub_id], (err, subSubResult) => {
      if (err) {
        console.error("Error executing subsubcategory query:", err);
        res.status(500).json({ error: "Error executing subsubcategory query" });
        return;
      }

      if (subSubResult.length > 0) {
        // Subsubcategory found in the subsubcategory table
        const ss_id = subSubResult[0].ss_id;
        const desc = subSubResult[0].des;

        const productQuery = `
          SELECT 
            main_table.id, 
            main_table.name, 
            main_table.price, 
            main_table.category_id, 
            IMAGE.PATH1 AS img 
          FROM 
            ${category} AS main_table 
          INNER JOIN 
            IMAGE ON main_table.id = IMAGE.product_id
          ORDER BY ${subcategory}
        `;

        db.query(productQuery, (err, productResults) => {
          if (err) {
            console.error("Error executing product query:", err);
            res.status(500).json({ error: "Error executing product query" });
            return;
          }

          const formattedProducts = productResults.map((item) => ({
            ...item,
            img: String(item.img),
          }));

          const response = {
            desc,
            products: formattedProducts,
          };
          res.json(response);
        });
      } else {
        // Subsubcategory not found, handle exception
        handleSubSubcategoryNotFound(category, subcategory, res);
      }
    });
  });
};

const handleSubSubcategoryNotFound = (category, subcategory, res) => {
  const sql = `SELECT sub_desc FROM subcategory WHERE sub_name = ?`;
  
  db.query(sql, [subcategory], (err, result) => {
    if (err) {
      console.error("Error executing first query:", err);
      res.status(500).json({ error: "Error executing first query" });
      return;
    }
    
    let desc = result[0]?.sub_desc; // Safely access sub_desc

    if (!desc) {
      console.warn("Description not found for subcategory:", subCategory);
      res.status(404).json({ error: "Description not found" });
      return;
    }

    const productQuery = `
      SELECT 
        main_table.id, 
        main_table.name, 
        main_table.price, 
        main_table.category_id, 
        IMAGE.PATH1 AS img 
      FROM 
        ${category} AS main_table 
      INNER JOIN 
        IMAGE ON main_table.id = IMAGE.product_id
      WHERE main_table.type LIKE ?
      ORDER BY main_table.name
    `;

    db.query(productQuery, [`%${subcategory}%`], (err, productResults) => {
      if (err) {
        console.error("Error executing product query:", err);
        res.status(500).json({ error: "Error executing product query" });
        return;
      }
      const formattedProducts = productResults.map((item) => ({
        ...item,
        img: item.img.toString(),
      }));

      const response = {
        desc: desc,
        products: formattedProducts,
      };
      res.json(response);
    });
  });
};

const fetchFilters = async (req, res) => {
  const category = req.params.category;

  const checkColumnExistence = (column) => {
    return new Promise((resolve, reject) => {
      const checkQuery = `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = ? AND COLUMN_NAME = ? AND TABLE_SCHEMA = 'main_project';
      `;
      db.query(checkQuery, [category, column], (err, result) => {
        if (err) reject(err);
        resolve(result.length > 0);
      });
    });
  };

  try {
    const colorColumnExists = await checkColumnExistence('color');
    const sizeColumnExists = await checkColumnExistence('size');

    if (!colorColumnExists && !sizeColumnExists) {
      res.status(400).json({ error: "Neither 'color' nor 'size' columns exist in the view." });
      return;
    }

    const executeQuery = (query) => {
      return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });
    };

    let colorResults = [];
    if (colorColumnExists) {
      const colorQuery = `
        SELECT DISTINCT LOWER(SUBSTRING_INDEX(SUBSTRING_INDEX(color, ',', n.n), ',', -1)) AS color
        FROM ${category}
        CROSS JOIN (SELECT a.N + b.N * 10 + 1 n
                    FROM (SELECT 0 N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a
                    CROSS JOIN (SELECT 0 N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) b
                   ) n
        WHERE n.n <= 1 + (LENGTH(color) - LENGTH(REPLACE(color, ',', '')))
        ORDER BY color;
      `;
      colorResults = await executeQuery(colorQuery);
    }

    let sizeResults = [];
    if (sizeColumnExists) {
      const sizeQuery = `
        SELECT DISTINCT size
        FROM ${category}
        WHERE size IS NOT NULL
        ORDER BY size;
      `;
      sizeResults = await executeQuery(sizeQuery);
    }

    const uniqueColors = [
      ...new Set(colorResults.map((row) => row.color?.trim()).filter(Boolean)),
    ];
    const uniqueSizes = [
      ...new Set(sizeResults.map((row) => row.size?.trim()).filter(Boolean)),
    ];

    res.json({
      colors: uniqueColors.length > 0 ? uniqueColors : null,
      sizes: uniqueSizes.length > 0 ? uniqueSizes : null,
    });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Error executing query" });
  }
};

const filterData = (req, res) => {
  const category = req.params.category;
  const { color, size, sort } = req.query; // Use query parameters for filters and sorting

  let filterQuery = `
    SELECT 
      main_table.id, 
      main_table.name, 
      main_table.price, 
      main_table.category_id, 
      IMAGE.PATH1 AS img 
    FROM 
      ?? AS main_table 
    INNER JOIN 
      IMAGE ON main_table.id = IMAGE.product_id 
    WHERE 
      1 = 1
  `;

  const filterValues = [category];

  if (color) {
    filterQuery += " AND LOWER(main_table.color) LIKE ?";
    filterValues.push(`%${color.toLowerCase()}%`);
  }

  if (size) {
    filterQuery += " AND LOWER(main_table.size) LIKE ?";
    filterValues.push(`%${size.toLowerCase()}%`);
  }

  if (sort) {
    if (sort === "price:_low_to_high") {
      filterQuery += " ORDER BY main_table.price ASC";
    } else if (sort === "price:_high_to_low") {
      filterQuery += " ORDER BY main_table.price DESC";
    }
  }

  db.query(filterQuery, filterValues, (err, results) => {
    if (err) {
      console.error("Error executing filter query:", err);
      res.status(500).json({ error: "Error executing filter query" });
      return;
    }

    // Convert the img field to a string for each result
    const formattedProducts = results.map((item) => ({
      ...item,
      img: String(item.img),
    }));

    res.json({ products: formattedProducts });
  });
};

module.exports = {
  fetchDataCat,
  fetchDataSubCat,
  fetchFilters,
  filterData,
};
