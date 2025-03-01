const mysql = require("mysql");

// Database connection
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hetalsql@1405",
  database: "main_project",
});

// Generate a unique cart ID
const generateCartId = (callback) => {
  const sql = "SELECT MAX(ca_id) AS maxId FROM cart";
  conn.query(sql, (err, result) => {
    if (err) return callback(err);

    const maxId = result[0].maxId;
    let newId;

    if (maxId) {
      const numericPart = parseInt(maxId.slice(2)) + 1;
      newId = `CA${String(numericPart).padStart(3, "0")}`;
    } else {
      newId = "CA001";
    }

    callback(null, newId);
  });
};

// Add Item to Cart
// Add Item to Cart
const addItemToCart = (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ message: "Please login to add items to the cart." });
  }

  const productId = req.body.productId;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required." });
  }

  const viewsQuery = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = 'main_project'`;

  conn.query(viewsQuery, (err, views) => {
    if (err) return res.status(500).json({ error: "Database error." });

    const searchQueries = views
      .map((view) => {
        return `SELECT product_id FROM ${view.TABLE_NAME} WHERE product_id = ?`;
      })
      .join(" UNION ALL ");

    const query = `${searchQueries}`;

    conn.query(
      query,
      new Array(views.length).fill(productId),
      (err, results) => {
        if (err) return res.status(500).json({ error: "Database error." });

        if (results.length === 0) {
          return res.status(400).json({ error: "Invalid product ID." });
        }

        generateCartId((err, newCartId) => {
          if (err)
            return res.status(500).json({ error: "Error generating cart ID." });

          const sql =
            "INSERT INTO cart (ca_id, c_id, product_id, ca_qty) VALUES (?, ?, ?, ?)";
          conn.query(
            sql,
            [newCartId, req.session.userId, productId, 1],
            (err, result) => {
              if (err)
                return res.status(500).json({ error: "Database error." });

              res.status(200).json({ message: "Item added to cart." });
            }
          );
        });
      }
    );
  });
};
const addItemToCartFromProduct = (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ message: "Please login to add items to the cart." });
  }

  const { prodname: productName, quantity } = req.body;

  if (!productName) {
    return res.status(400).json({ error: "Product name is required." });
  }

  const viewsQuery = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = 'main_project'`;

  conn.query(viewsQuery, (err, views) => {
    if (err) return res.status(500).json({ error: "Database error." });

    const searchQueries = views
      .map((view) => {
        return `SELECT id FROM ${view.TABLE_NAME} WHERE name = ?`;
      })
      .join(" UNION ALL ");

    const query = `${searchQueries}`;

    conn.query(
      query,
      new Array(views.length).fill(productName),
      (err, results) => {
        if (err) return res.status(500).json({ error: "Database error." });
        if (results.length === 0) {
          return res.status(404).json({ error: "Product not found." });
        }
        
        const productId = results[0].id;

        generateCartId((err, newCartId) => {
          if (err)
            return res.status(500).json({ error: "Error generating cart ID." });

          const sql =
            "INSERT INTO cart (ca_id, c_id, product_id, ca_qty) VALUES (?, ?, ?, ?)";
          conn.query(
            sql,
            [newCartId, req.session.userId, productId, quantity],
            (err, result) => {
              if (err)
                return res.status(500).json({ error: "Database error." });

              res.status(200).json({ message: "Item added to cart." });
            }
          );
        });
      }
    );
  });
};

// Get User Cart
const getUserCart = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Please login to view your cart." });
  }
  const viewsQuery = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = 'main_project'`;
  conn.query(viewsQuery, (err, views) => {
    if (err) return res.status(500).json({ error: "Database error." });

    const userId = req.session.userId;
    const searchQueries = views
      .map((view) => {
        return `
        SELECT c.CA_ID, c.C_ID, c.PRODUCT_ID, c.CA_QTY, v.name, v.price, img.PATH1 AS image
        FROM cart c
        JOIN ${view.TABLE_NAME} v ON c.PRODUCT_ID = v.id
        JOIN IMAGE img ON v.id = img.PRODUCT_ID
        WHERE c.C_ID = ?
        `;
      })
      .join(" UNION ALL ");

    const query = `${searchQueries}`;

    conn.query(query, new Array(views.length).fill(userId), (err, results) => {
      if (err) return res.status(500).json({ error: "Database error." });

      results.forEach((result) => {
        if (result.image) {
          result.image = result.image.toString();
        }
        result.total = result.CA_QTY * result.price;
      });
      res.status(200).json(results);
    });
  });
};

// Update Cart Item
const updateCartItem = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Please login to update your cart." });
  }
  // console.log(req.body)
  const cartId = req.body.CA_ID;
  const quantity = req.body.qty;
  const sql = "UPDATE cart SET ca_qty = ? WHERE ca_id = ?";
  conn.query(sql, [quantity, cartId], (err, result) => {
    if (err) throw err;
    res.status(200).json({ message: "Cart item updated." });
  });
};

// Remove Item from Cart
const removeItemFromCart = (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ error: "Please login to remove items from your cart." });
  }
  const { cartId } = req.body;
  const sql = "DELETE FROM cart WHERE ca_id = ? AND c_id=?";
  conn.query(sql, [cartId, req.session.userId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found." });
    }

    res.status(200).json({ message: "Item removed from cart." });
  });
};

const getCartCount = (req, res) => {
  if (!req.session.userId) {
    return res.json({ count: "0" });
  }

  const sql = "SELECT COUNT(*) AS count FROM cart WHERE c_id = ?";
  conn.query(sql, [req.session.userId], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error." });

    const count = result[0].count;
    res.status(200).json({ count });
  });
};

module.exports = {
  addItemToCart,
  addItemToCartFromProduct,
  getUserCart,
  updateCartItem,
  removeItemFromCart,
  getCartCount,
};
