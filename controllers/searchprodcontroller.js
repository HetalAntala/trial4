const mysql = require("mysql");

// Database connection
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hardi@sql8705",
  database: "main_project",
});

const searchProducts = (req, res) => {
  const searchTerm = req.query.q;

  const query = `
    SELECT 
      'PLANTS' AS category, P_ID AS id, P_NAME AS name, P_PRICE AS price, P_DESC AS description
    FROM PLANTS WHERE P_NAME LIKE ?
    UNION ALL
    SELECT 
      'BOUQUET' AS category, B_ID AS id, B_NAME AS name, B_PRICE AS price, B_DESC AS description
    FROM BOUQUET WHERE B_NAME LIKE ?
    UNION ALL
    SELECT 
      'POTS' AS category, PT_ID AS id, PT_NAME AS name, PT_PRICE AS price, PT_DESC AS description
    FROM POTS WHERE PT_NAME LIKE ?
    UNION ALL
    SELECT 
      'FERTILIZERS' AS category, Ft_ID AS id, Ft_NAME AS name, Ft_PRICE AS price, Ft_DESC AS description
    FROM FERTILIZERS WHERE Ft_NAME LIKE ?
    UNION ALL
    SELECT 
      'TOOLS' AS category, T_ID AS id, T_NAME AS name, T_PRICE AS price, T_DESC AS description
    FROM TOOLS WHERE T_NAME LIKE ?
  `;

  const searchPattern = `%${searchTerm}%`;

  conn.query(
    query,
    [
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
    ],
    (err, results) => {
      if (err) {
        console.error("Error executing query: " + err.message);
        res.status(500).send("Error executing query");
        return;
      }

      res.json(results);
    }
  );
};

module.exports = {
  searchProducts,
};
