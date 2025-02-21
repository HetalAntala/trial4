const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hardi@sql8705",
  database: "main_project",
});

// Connect to the database
conn.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    return;
  }
  console.log("Connected to the database");
});

const getProductDetails = (req, res) => {
  const productName = req.params.name;
  const productQuery = `
    SELECT 
      PLANTS.P_ID AS productId, 
      PLANTS.P_NAME AS name, 
      PLANTS.P_PRICE AS price, 
      IMAGE.PATH1 AS image1, 
      IMAGE.PATH2 AS image2, 
      IMAGE.PATH3 AS image3, 
      PLANTS.P_DESC AS description 
    FROM 
      PLANTS 
    JOIN 
      IMAGE 
    ON 
      PLANTS.P_ID = IMAGE.PRODUCT_ID 
    WHERE 
      PLANTS.P_NAME = ? 
    UNION 
    SELECT 
      BOUQUET.B_ID AS productId, 
      BOUQUET.B_NAME AS name, 
      BOUQUET.B_PRICE AS price, 
      IMAGE.PATH1 AS image1, 
      IMAGE.PATH2 AS image2, 
      IMAGE.PATH3 AS image3, 
      BOUQUET.B_DESC AS description 
    FROM 
      BOUQUET 
    JOIN 
      IMAGE 
    ON 
      BOUQUET.B_ID = IMAGE.PRODUCT_ID 
    WHERE 
      BOUQUET.B_NAME = ? 
    UNION 
    SELECT 
      POTS.PT_ID AS productId, 
      POTS.PT_NAME AS name, 
      POTS.PT_PRICE AS price, 
      IMAGE.PATH1 AS image1, 
      IMAGE.PATH2 AS image2, 
      IMAGE.PATH3 AS image3, 
      POTS.PT_DESC AS description 
    FROM 
      POTS 
    JOIN 
      IMAGE 
    ON 
      POTS.PT_ID = IMAGE.PRODUCT_ID 
    WHERE 
      POTS.PT_NAME = ? 
    UNION 
    SELECT 
      FERTILIZERS.Ft_ID AS productId, 
      FERTILIZERS.Ft_NAME AS name, 
      FERTILIZERS.Ft_PRICE AS price, 
      IMAGE.PATH1 AS image1, 
      IMAGE.PATH2 AS image2, 
      IMAGE.PATH3 AS image3, 
      FERTILIZERS.Ft_DESC AS description 
    FROM 
      FERTILIZERS 
    JOIN 
      IMAGE 
    ON 
      FERTILIZERS.Ft_ID = IMAGE.PRODUCT_ID 
    WHERE 
      FERTILIZERS.Ft_NAME = ? 
    UNION 
    SELECT 
      TOOLS.T_ID AS productId, 
      TOOLS.T_NAME AS name, 
      TOOLS.T_PRICE AS price, 
      IMAGE.PATH1 AS image1, 
      IMAGE.PATH2 AS image2, 
      IMAGE.PATH3 AS image3, 
      TOOLS.T_DESC AS description 
    FROM 
      TOOLS 
    JOIN 
      IMAGE 
    ON 
      TOOLS.T_ID = IMAGE.PRODUCT_ID 
    WHERE 
      TOOLS.T_NAME = ?
  `;

  conn.query(
    productQuery,
    [productName, productName, productName, productName, productName],
    (err, results) => {
      if (err) {
        console.error("Error executing product query: " + err.message);
        res.status(500).send("Error executing product query");
        return;
      }

      if (results.length === 0) {
        res.status(404).send("Product not found");
        return;
      }

      const product = results[0];
      const feedbackQuery = `
        SELECT  
          f.f_desc, 
          f.f_date,
          cu.c_username AS username 
        FROM 
          feedback f 
        JOIN 
          customer cu 
        ON 
          f.c_id = cu.c_id 
        WHERE 
          f.product_id = ?
      `;

      conn.query(feedbackQuery, [product.productId], (err, feedbackResults) => {
        if (err) {
          console.error("Error executing feedback query: " + err.message);
          res.status(500).send("Error executing feedback query");
          return;
        }

        const responseData = {
          productId: product.productId,
          name: product.name,
          price: product.price,
          images: [
            product.image1 ? product.image1.toString() : null,
            product.image2 ? product.image2.toString() : null,
            product.image3 ? product.image3.toString() : null,
          ].filter(Boolean),
          description: product.description,
          feedback: feedbackResults,
        };

        res.json(responseData);
      });
    }
  );
};

module.exports = {
  getProductDetails,
};
