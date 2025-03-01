const mysql = require("mysql");

// Database connection
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hetalsql@1405",
  database: "main_project",
});

// Generate a unique wishlist ID
const generateWishlistId = (callback) => {
  const sql = "SELECT MAX(w_id) AS maxId FROM wishlist";
  conn.query(sql, (err, result) => {
    if (err) return callback(err);

    const maxId = result[0].maxId;
    let newId;

    if (maxId) {
      const numericPart = parseInt(maxId.slice(1)) + 1;
      newId = `W${String(numericPart).padStart(3, "0")}`;
    } else {
      newId = "W001";
    }

    callback(null, newId);
  });
};

// Add Item to Wishlist
const addItemToWishlist = (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ error: "Please login to add items to the wishlist." });
  }

  const productId = req.body.prodid;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required." });
  }

  generateWishlistId((err, newWishlistId) => {
    if (err)
      return res.status(500).json({ error: "Error generating wishlist ID." });

    const sql =
      "INSERT INTO wishlist (w_id, c_id, product_id) VALUES (?, ?, ?)";
    conn.query(
      sql,
      [newWishlistId, req.session.userId, productId],
      (err, result) => {
        if (err) return res.status(500).json({ error: "Database error." });

        res.status(200).json({ message: "Item added to wishlist." });
      }
    );
  });
};

// Get User Wishlist
const getUserWishlist = (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ message : "Please login to view your wishlist." });
  }

  const viewsQuery = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = 'main_project'`;

  conn.query(viewsQuery, (err, views) => {
    if (err) return res.status(500).json({ error: "Database error." });

    const userId = req.session.userId;
    const searchQueries = views
      .map((view) => {
        return `
        SELECT w.w_id, w.c_id, w.product_id, v.name, v.price, img.PATH1 AS image
        FROM wishlist w
        JOIN ${view.TABLE_NAME} v ON w.product_id = v.id
        JOIN IMAGE img ON v.id = img.PRODUCT_ID
        WHERE w.c_id = ?
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
      });

      res.status(200).json(results);
    });
  });
};

// Remove Item from Wishlist
const removeItemFromWishlist = (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ error: "Please login to remove items from your wishlist." });
  }

  const { wishlistId } = req.body;
  const sql = "DELETE FROM wishlist WHERE w_id = ? AND c_id = ?";
  conn.query(sql, [wishlistId, req.session.userId], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error." });

    res.status(200).json({ message: "Item removed from wishlist." });
  });
};

// Move Item from Wishlist to Cart
const moveItemToCart = (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ error: "Please login to move items to the cart." });
  }

  const { wishlistId, quantity } = req.body;

  // Get the product ID from the wishlist item
  const getProductIDSql =
    "SELECT product_id FROM wishlist WHERE w_id = ? AND c_id = ?";
  conn.query(
    getProductIDSql,
    [wishlistId, req.session.userId],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error executing query" });

      if (result.length === 0) {
        return res.status(404).json({ error: "Wishlist item not found" });
      }

      const productId = result[0].product_id;

      // Remove the item from the wishlist
      const removeSql = "DELETE FROM wishlist WHERE w_id = ?";
      conn.query(removeSql, [wishlistId], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error." });

        // Add the item to the cart
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

              res.status(200).json({ message: "Item moved to cart." });
            }
          );
        });
      });
    }
  );
};

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

// Get Wishlist Count for a Specific User
const getWishlistCount = (req, res) => {
  if (!req.session.userId) {
    return res.json({count:"0" });
  }

  const sql = "SELECT COUNT(*) AS count FROM wishlist WHERE c_id = ?";
  conn.query(sql, [req.session.userId], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error." });

    const count = result[0].count;
    res.status(200).json({ count });
  });
};

module.exports = {
  addItemToWishlist,
  getUserWishlist,
  removeItemFromWishlist,
  moveItemToCart,
  getWishlistCount,
};
