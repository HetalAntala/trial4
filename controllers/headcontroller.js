const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hardi@sql8705",
  database: "main_project",
});

const getCategoryData = (query) => (req, res) => {
  conn.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.message);
      res.status(500).send("Error executing query");
      return;
    }

    const items = results.map((row) => ({
      name:
        row.P_NAME || row.B_NAME || row.PT_NAME || row.FT_NAME || row.T_NAME,
      price: row.P_PRICE || row.B_PRICE || row.PT_PRICE || row.FT_PRICE,
      image: row.PATH1 ? row.PATH1.toString() : null,
    }));
    const responseData = {
      count: results.length,
      items: items,
    };

    res.json(responseData);
  });
};

const getSubCategoryData = (query, countQuery) => (req, res) => {
  const subCategory = req.params.subCategory;

  // Execute the count query to get the count of items in the subcategory
  conn.query(countQuery, [subCategory], (err, countResults) => {
    if (err) {
      console.error("Error executing count query: " + err.message);
      res.status(500).send("Error executing count query");
      return;
    }

    const count = countResults[0].count;

    // Execute the main query to get the items in the subcategory
    conn.query(query, [subCategory], (err, results) => {
      if (err) {
        console.error("Error executing query: " + err.message);
        res.status(500).send("Error executing query");
        return;
      }

      const items = results.map((row) => ({
        name:
          row.P_NAME || row.B_NAME || row.PT_NAME || row.FT_NAME || row.T_NAME,
        price: row.P_PRICE || row.B_PRICE || row.PT_PRICE || row.FT_PRICE,
        image: row.PATH1 ? row.PATH1.toString() : null,
      }));
      const responseData = {
        count: count,
        items: items,
      };

      res.json(responseData);
    });
  });
};

const plantsdata = (req, res) => {
  const query = `
    SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1
    FROM PLANTS
    JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID
  `;

  conn.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).send("Error executing query");
      return;
    }

    const items = results.map((row) => ({
      name: row.P_NAME,
      price: row.P_PRICE,
      image: row.PATH1 ? row.PATH1.toString() : null,
    }));

    res.json({
      count: items.length,
      items: items,
    });
  });
};

const bouquetdata = (req, res) => {
  const query = `
    SELECT bouquet.B_NAME, bouquet.B_PRICE, IMAGE.PATH1
    FROM bouquet
    JOIN IMAGE ON bouquet.b_ID = IMAGE.PRODUCT_ID
  `;

  conn.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).send("Error executing query");
      return;
    }

    const items = results.map((row) => ({
      name: row.B_NAME,
      price: row.B_PRICE,
      image: row.PATH1 ? row.PATH1.toString() : null,
    }));

    res.json({
      count: items.length,
      items: items,
    });
  });
};

const potsdata = (req, res) => {
  const query = `
    SELECT POTS.PT_NAME, POTS.PT_PRICE, IMAGE.PATH1
    FROM POTS
    JOIN IMAGE ON POTS.PT_ID = IMAGE.PRODUCT_ID
  `;

  conn.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).send("Error executing query");
      return;
    }

    const items = results.map((row) => ({
      name: row.PT_NAME,
      price: row.PT_PRICE,
      image: row.PATH1 ? row.PATH1.toString() : null,
    }));

    res.json({
      count: items.length,
      items: items,
    });
  });
};

const fertilizerdata = (req, res) => {
  const query = `
    SELECT FERTILIZERS.FT_NAME, FERTILIZERS.FT_PRICE, IMAGE.PATH1
    FROM FERTILIZERS
    JOIN IMAGE ON FERTILIZERS.FT_ID = IMAGE.PRODUCT_ID
  `;

  conn.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).send("Error executing query");
      return;
    }

    const items = results.map((row) => ({
      name: row.FT_NAME,
      price: row.FT_PRICE,
      image: row.PATH1 ? row.PATH1.toString() : null,
    }));

    res.json({
      count: items.length,
      items: items,
    });
  });
};

const toolsdata = (req, res) => {
  const query = `
    SELECT TOOLS.T_NAME, TOOLS.T_PRICE, IMAGE.PATH1
    FROM TOOLS
    JOIN IMAGE ON TOOLS.T_ID = IMAGE.PRODUCT_ID
  `;

  conn.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).send("Error executing query");
      return;
    }

    const items = results.map((row) => ({
      name: row.T_NAME,
      price: row.T_PRICE,
      image: row.PATH1 ? row.PATH1.toString() : null,
    }));

    res.json({
      count: items.length,
      items: items,
    });
  });
};

// Predefined queries for different categories
const queries = {
  // Plant-related queries
  categorydata: "SELECT count(*) as count FROM PLANTS",
  seasonal_plants:
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID ORDER BY PLANTS.P_SEASON",
  suitable_locations:
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID ORDER BY PLANTS.P_LOCATION",
  plant_types:
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID ORDER BY PLANTS.P_TYPE",
  flowering_plant:
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, PLANTS.P_FLOWERING_PLANT, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE NOT (PLANTS.P_FLOWERING_PLANT = 'NO')",

  // Bouquet-related queries
  occassion_type:
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID ORDER BY B_OCCASSION",
  wrapping_style:
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID ORDER BY BOUQUET.B_wrapping_Type",
  arrangement_style:
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID ORDER BY BOUQUET.B_type",
  flower_varieties:
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID ORDER BY BOUQUET.B_flowers",

  // Gardening-related queries
  plant_containers:
    "SELECT POTS.Pt_NAME, POTS.Pt_PRICE, IMAGE.PATH1 FROM POTS JOIN IMAGE ON POTS.Pt_ID = IMAGE.PRODUCT_ID",
  soil_nutrients:
    "SELECT FERTILIZERS.Ft_NAME, FERTILIZERS.Ft_PRICE, IMAGE.PATH1 FROM FERTILIZERS JOIN IMAGE ON FERTILIZERS.Ft_ID = IMAGE.PRODUCT_ID",
  gardening_tools:
    "SELECT TOOLS.T_NAME, TOOLS.T_PRICE, IMAGE.PATH1 FROM TOOLS JOIN IMAGE ON TOOLS.T_ID = IMAGE.PRODUCT_ID",
};

const subCategoryQueries = {
  // Plants-Season
  "season/summer": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_SEASON like '%summer%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_SEASON like '%summer%'",
  ],
  "season/monsoon": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_SEASON like '%Monsoon%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_SEASON like '%Monsoon%'",
  ],
  "season/winter": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_SEASON like '%winter%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_SEASON like '%winter%'",
  ],
  "season/spring": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_SEASON like '%spring%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_SEASON like '%spring%'",
  ],
  "season/autumn": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_SEASON like '%autumn%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_SEASON like '%autumn%'",
  ],
  "season/all-seasons": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_SEASON like 'all Seasons'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_SEASON like 'all Seasons'",
  ],

  // Plants-Location
  "location/indoor": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_LOCATION like '%in%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_LOCATION like '%in%'",
  ],
  "location/outdoor": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_LOCATION like '%ou%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_LOCATION like '%ou%'",
  ],
  "location/office": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_LOCATION like '%of%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_LOCATION like '%of%'",
  ],
  "location/balcony": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_LOCATION like '%ba%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_LOCATION like '%ba%'",
  ],
  "location/bedroom": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_LOCATION like '%be%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_LOCATION like '%be%'",
  ],
  "location/terrace": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_LOCATION like '%te%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_LOCATION like '%te%'",
  ],
  "location/living-room": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_LOCATION like '%li%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_LOCATION like '%li%'",
  ],

  // Plants-Types
  "type/air-plants": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_TYPE like '%air plants%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_TYPE like '%air plants%'",
  ],
  "type/bamboo": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_TYPE like '%bamboo%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_TYPE like '%bamboo%'",
  ],
  "type/climber": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_TYPE like '%climber%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_TYPE like '%climber%'",
  ],
  "type/creeper": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_TYPE like '%creeper%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_TYPE like '%creeper%'",
  ],
  "type/cactus": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_TYPE like '%cactus%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_TYPE like '%cactus%'",
  ],
  "type/herb": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_TYPE like '%herbs%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_TYPE = 'Herb'",
  ],
  "type/shrubs": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_TYPE like '%shrubs%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_TYPE like '%shrubs%'",
  ],

  // Plants-Flowering Plants
  "flowering/adenium": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_FLOWERING_PLANT like '%adenium%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_FLOWERING_PLANT like '%adenium%'",
  ],
  "flowering/rose": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_FLOWERING_PLANT like '%rose%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_FLOWERING_PLANT like '%rose%'",
  ],
  "flowering/lily": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_FLOWERING_PLANT like '%lily%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_FLOWERING_PLANT like '%lily%'",
  ],
  "flowering/hibiscus": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_FLOWERING_PLANT like '%hibiscus%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_FLOWERING_PLANT like '%hibiscus%'",
  ],
  "flowering/jasmine": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_FLOWERING_PLANT like 'jasmine'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_FLOWERING_PLANT like '%jasmine%'",
  ],
  "flowering/marigold": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_FLOWERING_PLANT like '%marigold%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_FLOWERING_PLANT like '%marigold%'",
  ],
  "flowering/carnation": [
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE P_FLOWERING_PLANT like '%carnation%'",
    "SELECT COUNT(*) AS count FROM PLANTS WHERE P_FLOWERING_PLANT like '%carnation%'",
  ],
};

const bouquetSubCategoryQueries = {
  // Bouquet- Occasion
  "occassion/birthday": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_OCCASSION like '%birthday%'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_OCCASSION like '%birthday%'",
  ],
  "occassion/anniversary": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_OCCASSION like '%anniversary%'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_OCCASSION like '%anniversary%'",
  ],
  "occassion/congratulations": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_OCCASSION like '%congratulations%'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_OCCASSION like '%congratulations%'",
  ],
  "occassion/get-well-soon": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_OCCASSION like '%get well soon%'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_OCCASSION like '%get well soon%'",
  ],
  "occassion/farewell": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_OCCASSION like '%farewell%'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_OCCASSION like '%farewell%'",
  ],
  "occassion/condolences": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_OCCASSION like '%condolences%'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_OCCASSION like '%condolences%'",
  ],

  // Bouquet-Wrapping Type
  "wrapping/flowers-in-a-box": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_wrapping_Type = 'Flower in Box'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_wrapping_Type = 'Flower in Box'",
  ],
  "wrapping/flowers-in-vase": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_wrapping_Type = 'Flower in Vase'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_wrapping_Type = 'Flower in Vase'",
  ],
  "wrapping/ribbon-wrapped": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_wrapping_Type = 'Ribbon Wrapped Bouquet'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_wrapping_Type = 'Ribbon Wrapped Bouquet'",
  ],
  "wrapping/flower-basket": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_wrapping_Type = 'Flower Basket'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_wrapping_Type = 'Flower Basket'",
  ],
  "wrapping/cellophane-wrapped": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_wrapping_Type = 'Flower in Cellophane Wrapped'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_wrapping_Type = 'Flower in Cellophane Wrapped'",
  ],
  "wrapping/tissue-wrapped": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_wrapping_Type = 'Tissue Wrapped'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_wrapping_Type = 'Tissue Wrapped'",
  ],

  // Bouquet-Type
  "type/heart-shape": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_TYPE = 'Heart-shape'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_TYPE = 'Heart-shape'",
  ],
  "type/flower-basket": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_TYPE = 'Flower-basket'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_TYPE = 'Flower-basket'",
  ],
  "type/flower-in-glass": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_TYPE = 'Flower in Glass'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_TYPE = 'Flower in Glass'",
  ],
  "type/hand-bouquet": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_TYPE = 'Hand-bouquet'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_TYPE = 'Hand-bouquet'",
  ],

  // Bouquet-Flowers
  "flowers/rose-bouquet": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_flowers like '%Rose%'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_flowers like '%Rose%'",
  ],
  "flowers/carnations-bouquet": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_flowers like '%carnations%'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_flowers like '%carnations%'",
  ],
  "flowers/lily-bouquet": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_flowers like '%lilies%'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_flowers like '%lilies%'",
  ],
  "flowers/mixed-flowers-bouquet": [
    "SELECT BOUQUET.B_NAME, BOUQUET.B_PRICE, IMAGE.PATH1 FROM BOUQUET JOIN IMAGE ON BOUQUET.B_ID = IMAGE.PRODUCT_ID WHERE B_flowers like '%mixed%'",
    "SELECT COUNT(*) AS count FROM BOUQUET WHERE B_flowers like '%mixed%'",
  ],
};

const potsSubCategoryQueries = {
  "type/plastic": [
    "SELECT * FROM POTS WHERE PT_TYPE = 'Plastic'",
    "SELECT COUNT(*) AS count FROM POTS WHERE PT_TYPE = 'Plastic'",
  ],
  "type/ceramic": [
    "SELECT * FROM POTS WHERE PT_TYPE = 'Ceramic'",
    "SELECT COUNT(*) AS count FROM POTS WHERE PT_TYPE = 'Ceramic'",
  ],
  "type/glass": [
    "SELECT * FROM POTS WHERE PT_TYPE = 'Glass'",
    "SELECT COUNT(*) AS count FROM POTS WHERE PT_TYPE = 'Glass'",
  ],
  "type/resin": [
    "SELECT * FROM POTS WHERE PT_TYPE = 'Resin'",
    "SELECT COUNT(*) AS count FROM POTS WHERE PT_TYPE = 'Resin'",
  ],
  "type/vase": [
    "SELECT * FROM POTS WHERE PT_TYPE = 'Vases'",
    "SELECT COUNT(*) AS count FROM PoTS WHERE PT_TYPE = 'Vases'",
  ],
  "type/hanging-pots": [
    "SELECT * FROM POTS WHERE PT_TYPE = 'Hanging Pots'",
    "SELECT COUNT(*) AS count FROM PoTS WHERE PT_TYPE = 'Hanging Pots'",
  ],
};

const fertilizersSubCategoryQueries = {
  "type/organic": [
    "SELECT * FROM FERTILIZERS WHERE FT_TYPE = 'Organic'",
    "SELECT COUNT(*) AS count FROM FERTILIZERS WHERE FT_TYPE = 'Organic'",
  ],
  "type/potting-soil": [
    "SELECT * FROM FERTILIZERS WHERE FT_TYPE = 'Potting Soil'",
    "SELECT COUNT(*) AS count FROM FERTILIZERS WHERE FT_TYPE = 'Potting Soil'",
  ],
  "type/cocopeat": [
    "SELECT * FROM FERTILIZERS WHERE FT_TYPE = 'Cocopeat'",
    "SELECT COUNT(*) AS count FROM FERTILIZERS WHERE FT_TYPE = 'Cocopeat'",
  ],
  "type/manure": [
    "SELECT * FROM FERTILIZERS WHERE FT_TYPE = 'Manure'",
    "SELECT COUNT(*) AS count FROM FERTILIZERS WHERE FT_TYPE = 'Manure'",
  ],
  "type/compost": [
    "SELECT * FROM FERTILIZERS WHERE FT_TYPE = 'Compost'",
    "SELECT COUNT(*) AS count FROM FERTILIZERS WHERE FT_TYPE = 'Compost'",
  ],
};
module.exports = {
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
};
