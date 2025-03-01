const mysql = require("mysql");

// Database connection
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hetalsql@1405",
  database: "main_project",
});

// Generate a unique feedback ID
const generateFeedbackId = (callback) => {
  const sql = "SELECT MAX(f_id) AS maxId FROM feedback";
  conn.query(sql, (err, result) => {
    if (err) return callback(err);

    const maxId = result[0].maxId;
    let newId;

    if (maxId) {
      const numericPart = parseInt(maxId.slice(1)) + 1;
      newId = `F${String(numericPart).padStart(3, "0")}`;
    } else {
      newId = "F001";
    }

    callback(null, newId);
  });
};

// Add Feedback
const addFeedback = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Please login to add feedback." });
  }

  const { productId, description } = req.body;
  const date = new Date();

  generateFeedbackId((err, newFeedbackId) => {
    if (err)
      return res.status(500).json({ error: "Error generating feedback ID." });

    const sql =
      "INSERT INTO feedback (f_id, f_desc, f_date, c_id, product_id) VALUES (?, ?, ?, ?, ?)";
    conn.query(
      sql,
      [newFeedbackId, description, date, req.session.userId, productId],
      (err, result) => {
        if (err) throw err;
        res.status(200).json({ message: "Feedback added." });
      }
    );
  });
};

// Get Product Feedback
const getProductFeedback = (req, res) => {
  const productId = req.params.productId;

  const sql = `
    SELECT f.*, cu.c_username AS username 
    FROM feedback f 
    JOIN customer cu ON f.c_id = cu.c_id 
    WHERE f.product_id = ?
  `;
  conn.query(sql, [productId], (err, result) => {
    if (err) throw err;
    res.status(200).json(result);
  });
};

// Delete Feedback
const deleteFeedback = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Please login to delete feedback." });
  }

  const feedbackId = req.body.feedbackId;
  const sql = "DELETE FROM feedback WHERE f_id = ? AND c_id = ?";
  conn.query(sql, [feedbackId, req.session.userId], (err, result) => {
    if (err) throw err;
    res.status(200).json({ message: "Feedback deleted." });
  });
};

const feedbacks = async (req, res) => {
  try {
    const viewsSql = `
      SELECT *
      FROM INFORMATION_SCHEMA.VIEWS
      WHERE TABLE_SCHEMA = 'main_project';
    `;
    conn.query(viewsSql, (err, viewsResult) => {
      if (err) throw err;

      // Check if viewsResult is an array and has values
      if (!Array.isArray(viewsResult) || viewsResult.length === 0) {
        return res.status(500).json({ error: "No views found in the schema." });
      }
      const views = viewsResult.map((row) => row.TABLE_NAME);

      // Define a function to fetch feedback data from each view
      const fetchFeedbackData = (view) => {
        return new Promise((resolve, reject) => {
          const sql = `
            SELECT F.F_ID, F.F_DESC, F.C_ID, F.PRODUCT_ID, C.C_USERNAME, CAT.CY_NAME
            FROM FEEDBACK AS F
            JOIN CUSTOMER AS C ON F.C_ID = C.C_ID
            JOIN ${view} AS EV ON F.PRODUCT_ID = EV.id
            JOIN CATEGORY AS CAT ON EV.category_id = CAT.CY_ID
            ORDER BY F.F_ID DESC;
          `;
          conn.query(sql, (err, result) => {
            if (err) {
              console.error(`Error querying view ${view}:`, err);
              return reject(err);
            }
            resolve(result);
          });
        });
      };

      // Fetch feedback data from all views and aggregate results
      const promises = views.map((view) => fetchFeedbackData(view));
      Promise.all(promises)
        .then((results) => {
          const feedbackData = results.flat();
          res.status(200).json(feedbackData);
        })
        .catch((err) => {
          console.error("Error fetching feedback data:", err);
          res
            .status(500)
            .json({ error: "An error occurred while fetching feedback data." });
        });
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching feedback data." });
  }
};

module.exports = {
  feedbacks,
  addFeedback,
  getProductFeedback,
  deleteFeedback,
};
