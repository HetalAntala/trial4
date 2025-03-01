const mysql = require("mysql");

// Database connection
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hetalsql@1405",
  database: "main_project",
});

const getViewsAndSearchProducts = (searchTerm, callback) => {
  const viewsQuery = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = 'main_project'`;

  conn.query(viewsQuery, (err, views) => {
    if (err) {
      callback(err, null);
      return;
    }

    const searchPattern = `%${searchTerm}%`;

    const searchQueries = views.map((view) => {
      return `
        SELECT '${view.TABLE_NAME}' AS category, id, name, price, description
        FROM ${view.TABLE_NAME}
        WHERE name LIKE ?
      `;
    }).join(" UNION ALL ");

    const query = `${searchQueries}`;

    conn.query(
      query,
      new Array(views.length).fill(searchPattern),
      (err, results) => {
        if (err) {
          callback(err, null);
          return;
        }

        callback(null, results);
      }
    );
  });
};

const searchProducts = (req, res) => {
  const searchTerm = req.query.q;

  getViewsAndSearchProducts(searchTerm, (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.message);
      res.status(500).json({ error: "Error executing query" });
      return;
    }

    res.json(results);
  });
};
const getViewsAndSearchKeywords = (searchTerm, callback) => {
  const viewsQuery = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = 'main_project'`;

  conn.query(viewsQuery, (err, views) => {
    if (err) {
      callback(err, null);
      return;
    }

    const searchPattern = `%${searchTerm}%`;

    const searchQueries = views.map((view) => {
      return `
        SELECT name AS keyword
        FROM ${view.TABLE_NAME}
        WHERE name LIKE ?
      `;
    }).join(" UNION ");

    const query = `${searchQueries}`;

    conn.query(
      query,
      new Array(views.length).fill(searchPattern),
      (err, results) => {
        if (err) {
          callback(err, null);
          return;
        }

        callback(null, results);
      }
    );
  });
};

const searchKeywords = (req, res) => {
  const searchTerm = req.query.q;

  getViewsAndSearchKeywords(searchTerm, (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.message);
      res.status(500).json({ error: "Error executing query" });
      return;
    }

    res.json(results);
  });
};

module.exports = {
  searchProducts,
  searchKeywords,
};
