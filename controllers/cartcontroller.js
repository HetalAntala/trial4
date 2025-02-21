const mysql = require("mysql");

// Database connection
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Hardi@sql8705',
  database: 'main_project',
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
const addItemToCart = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Please login to add items to the cart.");
  }

  const { productId, quantity } = req.body;

  // Validate the product ID against all category tables
  const checkProductSql = `
    SELECT 'PLANTS' AS category FROM PLANTS WHERE P_ID = ?
    UNION ALL
    SELECT 'BOUQUET' AS category FROM BOUQUET WHERE B_ID = ?
    UNION ALL
    SELECT 'POTS' AS category FROM POTS WHERE PT_ID = ?
    UNION ALL
    SELECT 'FERTILIZERS' AS category FROM FERTILIZERS WHERE Ft_ID = ?
    UNION ALL
    SELECT 'TOOLS' AS category FROM TOOLS WHERE T_ID = ?
  `;

  conn.query(
    checkProductSql,
    [productId, productId, productId, productId, productId],
    (err, productResult) => {
      if (err) throw err;

      if (productResult.length === 0) {
        return res.status(400).send("Invalid product ID.");
      }

      generateCartId((err, newCartId) => {
        if (err) return res.status(500).send("Error generating cart ID.");

        const sql =
          "INSERT INTO cart (ca_id, c_id, product_id, ca_qty) VALUES (?, ?, ?, ?)";
        conn.query(
          sql,
          [newCartId, req.session.userId, productId, quantity],
          (err, result) => {
            if (err) throw err;
            res.status(200).send("Item added to cart.");
          }
        );
      });
    }
  );
};

// Add Item to Cart from Product Detail Page
const addItemToCartFromProduct = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Please login to add items to the cart.");
  }

  const { productName, quantity } = req.body;

  // Get the product ID based on the product name
  const getProductIDSql = `
    SELECT P_ID AS id FROM PLANTS WHERE P_NAME = ? 
    UNION ALL 
    SELECT B_ID AS id FROM BOUQUET WHERE B_NAME = ? 
    UNION ALL 
    SELECT PT_ID AS id FROM POTS WHERE PT_NAME = ? 
    UNION ALL 
    SELECT Ft_ID AS id FROM FERTILIZERS WHERE Ft_NAME = ? 
    UNION ALL 
    SELECT T_ID AS id FROM TOOLS WHERE T_NAME = ?
  `;

  conn.query(
    getProductIDSql,
    [productName, productName, productName, productName, productName],
    (err, result) => {
      if (err) return res.status(500).send("Error executing query");

      if (result.length === 0) {
        return res.status(404).send("Product not found");
      }

      const productId = result[0].id;

      generateCartId((err, newCartId) => {
        if (err) return res.status(500).send("Error generating cart ID.");

        const sql =
          "INSERT INTO cart (ca_id, c_id, product_id, ca_qty) VALUES (?, ?, ?, ?)";
        conn.query(
          sql,
          [newCartId, req.session.userId, productId, quantity],
          (err, result) => {
            if (err) throw err;
            res.status(200).send("Item added to cart.");
          }
        );
      });
    }
  );
};

// Get User Cart
const getUserCart = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Please login to view your cart.");
  }

  const sql = "SELECT * FROM cart WHERE c_id = ?";
  conn.query(sql, [req.session.userId], (err, result) => {
    if (err) throw err;
    res.status(200).json(result);
  });
};

// Update Cart Item
const updateCartItem = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Please login to update your cart.");
  }

  const { cartId, quantity } = req.body;
  const sql = "UPDATE cart SET ca_qty = ? WHERE ca_id = ?";
  conn.query(sql, [quantity, cartId], (err, result) => {
    if (err) throw err;
    res.status(200).send("Cart item updated.");
  });
};

// Remove Item from Cart
const removeItemFromCart = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Please login to remove items from your cart.");
  }

  const { cartId } = req.body;
  const sql = "DELETE FROM cart WHERE ca_id = ?";
  conn.query(sql, [cartId], (err, result) => {
    if (err) throw err;
    res.status(200).send("Item removed from cart.");
  });
};

module.exports = {
  addItemToCart,
  addItemToCartFromProduct,
  getUserCart,
  updateCartItem,
  removeItemFromCart,
};
