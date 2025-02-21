const mysql = require("mysql");

// Database connection
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hardi@sql8705",
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
    return res.status(401).send("Please login to add items to the wishlist.");
  }

  const { productId } = req.body;

  generateWishlistId((err, newWishlistId) => {
    if (err) return res.status(500).send("Error generating wishlist ID.");

    const sql =
      "INSERT INTO wishlist (w_id, c_id, product_id) VALUES (?, ?, ?)";
    conn.query(
      sql,
      [newWishlistId, req.session.userId, productId],
      (err, result) => {
        if (err) throw err;
        res.status(200).send("Item added to wishlist.");
      }
    );
  });
};

// Get User Wishlist
const getUserWishlist = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Please login to view your wishlist.");
  }

  const sql = `
      SELECT w.w_id, w.c_id, w.product_id, p.P_NAME AS name, p.P_PRICE AS price, p.P_DESC AS description
      FROM wishlist w
      JOIN PLANTS p ON w.product_id = p.P_ID
      WHERE w.c_id = ?
      UNION ALL
      SELECT w.w_id, w.c_id, w.product_id, b.B_NAME AS name, b.B_PRICE AS price, b.B_DESC AS description
      FROM wishlist w
      JOIN BOUQUET b ON w.product_id = b.B_ID
      WHERE w.c_id = ?
      UNION ALL
      SELECT w.w_id, w.c_id, w.product_id, pt.PT_NAME AS name, pt.PT_PRICE AS price, pt.PT_DESC AS description
      FROM wishlist w
      JOIN POTS pt ON w.product_id = pt.PT_ID
      WHERE w.c_id = ?
      UNION ALL
      SELECT w.w_id, w.c_id, w.product_id, f.Ft_NAME AS name, f.Ft_PRICE AS price, f.Ft_DESC AS description
      FROM wishlist w
      JOIN FERTILIZERS f ON w.product_id = f.Ft_ID
      WHERE w.c_id = ?
      UNION ALL
      SELECT w.w_id, w.c_id, w.product_id, t.T_NAME AS name, t.T_PRICE AS price, t.T_DESC AS description
      FROM wishlist w
      JOIN TOOLS t ON w.product_id = t.T_ID
      WHERE w.c_id = ?
    `;

  conn.query(
    sql,
    [
      req.session.userId,
      req.session.userId,
      req.session.userId,
      req.session.userId,
      req.session.userId,
    ],
    (err, result) => {
      if (err) throw err;
      res.status(200).json(result);
    }
  );
};

// Remove Item from Wishlist
const removeItemFromWishlist = (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .send("Please login to remove items from your wishlist.");
  }

  const { wishlistId } = req.body;
  const sql = "DELETE FROM wishlist WHERE w_id = ? AND c_id = ?";
  conn.query(sql, [wishlistId, req.session.userId], (err, result) => {
    if (err) throw err;
    res.status(200).send("Item removed from wishlist.");
  });
};

// Move Item from Wishlist to Cart
const moveItemToCart = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Please login to move items to the cart.");
  }

  const { wishlistId, quantity } = req.body;

  // Get the product ID from the wishlist item
  const getProductIDSql =
    "SELECT product_id FROM wishlist WHERE w_id = ? AND c_id = ?";
  conn.query(
    getProductIDSql,
    [wishlistId, req.session.userId],
    (err, result) => {
      if (err) return res.status(500).send("Error executing query");

      if (result.length === 0) {
        return res.status(404).send("Wishlist item not found");
      }

      const productId = result[0].product_id;

      // Remove the item from the wishlist
      const removeSql = "DELETE FROM wishlist WHERE w_id = ?";
      conn.query(removeSql, [wishlistId], (err, result) => {
        if (err) throw err;

        // Add the item to the cart
        generateCartId((err, newCartId) => {
          if (err) return res.status(500).send("Error generating cart ID.");

          const sql =
            "INSERT INTO cart (ca_id, c_id, product_id, ca_qty) VALUES (?, ?, ?, ?)";
          conn.query(
            sql,
            [newCartId, req.session.userId, productId, quantity],
            (err, result) => {
              if (err) throw err;
              res.status(200).send("Item moved to cart.");
            }
          );
        });
      });
    }
  );
};

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

module.exports = {
  addItemToWishlist,
  getUserWishlist,
  removeItemFromWishlist,
  moveItemToCart,
};
