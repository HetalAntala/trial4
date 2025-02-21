const mysql = require("mysql");

// Database connection
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hardi@sql87055",
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
    return res.status(401).send("Please login to add feedback.");
  }

  const { productId, description } = req.body;
  const date = new Date();

  generateFeedbackId((err, newFeedbackId) => {
    if (err) return res.status(500).send("Error generating feedback ID.");

    const sql =
      "INSERT INTO feedback (f_id, f_desc, f_date, c_id, product_id) VALUES (?, ?, ?, ?, ?)";
    conn.query(
      sql,
      [newFeedbackId, description, date, req.session.userId, productId],
      (err, result) => {
        if (err) throw err;
        res.status(200).send("Feedback added.");
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
    return res.status(401).send("Please login to delete feedback.");
  }

  const feedbackId = req.body.feedbackId;
  const sql = "DELETE FROM feedback WHERE f_id = ? AND c_id = ?";
  conn.query(sql, [feedbackId, req.session.userId], (err, result) => {
    if (err) throw err;
    res.status(200).send("Feedback deleted.");
  });
};

module.exports = {
  addFeedback,
  getProductFeedback,
  deleteFeedback,
};
