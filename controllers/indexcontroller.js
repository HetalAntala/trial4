const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hardi@sql8705",
  database: "main_project",
});

// Helper function to execute queries
const executeQuery = (query, res, req, next, key) => {
  conn.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err.stack);
      res.status(500).send("Error executing query");
      return;
    }
    results.forEach((item) => {
      if (item.PATH1) item.PATH1 = item.PATH1.toString();
      if (item.PATH2) item.PATH2 = item.PATH2.toString();
    });
    req[key] = results;
    next();
  });
};

// Route to get best-selling and new arrivals products
const bs = (req, res) => {
  const query =
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE PLANTS.P_ID IN ('P0001', 'P0002', 'P0003', 'P0004', 'P0023', 'P0024', 'P0025', 'P0026')";
  conn.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching best-selling products: " + err.message);
      res.status(500).send("Error fetching best-selling products");
    } else {
      result.forEach((item) => {
        item.PATH1 = item.PATH1.toString();
      });
      res.json(result);
    }
  });
};
const fa = (req, res) => {
  const query =
    "SELECT PLANTS.P_NAME, PLANTS.P_PRICE, IMAGE.PATH1 FROM PLANTS JOIN IMAGE ON PLANTS.P_ID = IMAGE.PRODUCT_ID WHERE PLANTS.P_ID IN ('P0001', 'P0002', 'P0003', 'P0004', 'P0023', 'P0024', 'P0025', 'P0026')";
  conn.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching best-selling products: " + err.message);
      res.status(500).send("Error fetching best-selling products");
    } else {
      result.forEach((item) => {
        item.PATH1 = item.PATH1.toString();
      });
      res.json(result);
      // console.log(result);
    }
  });
};
module.exports = { bs, fa };
