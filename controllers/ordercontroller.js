const mysql = require("mysql2/promise"); // Use the promise-based version

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hetalsql@1405",
  database: "main_project",
});

const placeOrder = async (req, res) => {
  var { s_add = null, s_pc = null, s_cno = null } = req.body;
  const connection = await conn;
  await connection.beginTransaction(); // Start a transaction

  try {
    // Get the max O_ID
    let [rows] = await connection.query(
      "SELECT MAX(O_ID) AS maxId FROM ORDER_MASTER"
    );
    let lastId = rows[0].maxId;
    let o_id = lastId
      ? "O" + (parseInt(lastId.slice(1)) + 1).toString().padStart(3, "0")
      : "O001";

    // Insert into ORDER_MASTER
    await connection.query(
      "INSERT INTO ORDER_MASTER(O_ID,O_DATE,O_STATUS,C_ID) VALUES(?,NOW(),'Placed',?)",
      [o_id, req.session.userId]
    );

    // Get details from CART
    [rows] = await connection.query("SELECT * FROM CART WHERE C_ID=?", [
      req.session.userId,
    ]);
    if (rows.length === 0) {
      throw new Error("Cart is empty");
    }

    // Process each item in the cart
    for (let row of rows) {
      let { CA_QTY: qty, PRODUCT_ID: product_id } = row;

      // Get the max Odetails_ID
      let [detailRows] = await connection.query(
        "SELECT MAX(Odetails_ID) AS maxId FROM ORDER_DETAILS"
      );
      let lastDetailId = detailRows[0].maxId;
      let odetails_id = lastDetailId
        ? "OD" +
          (parseInt(lastDetailId.slice(2)) + 1).toString().padStart(3, "0")
        : "OD001";

      // Dynamically fetch the views
      const viewsQuery = `
        SELECT table_name
        FROM INFORMATION_SCHEMA.views
        WHERE table_schema = 'main_project';
      `;
      const [viewsResult] = await connection.query(viewsQuery);

      if (viewsResult.length === 0) {
        throw new Error("No views found in the database");
      }

      let productDetailsTable = null;

      // Search for the product ID in each view
      for (const view of viewsResult) {
        const checkProductIdQuery = `
          SELECT price
          FROM ${view.TABLE_NAME}
          WHERE id = ?;
        `;
        const [result] = await connection.query(checkProductIdQuery, [
          product_id,
        ]);
        if (result.length > 0) {
          productDetailsTable = view.TABLE_NAME;
          var p_price = result[0].price;
          break;
        }
      }

      if (!productDetailsTable) {
        throw new Error("Product ID not found in any views");
      }

      let odetails_price = qty * p_price;

      // Insert into ORDER_DETAILS
      await connection.query(
        "INSERT INTO ORDER_DETAILS(ODETAILS_ID,O_ID,ODETAILS_QTY,ODETAILS_PRICE,Product_id) VALUES(?,?,?,?,?)",
        [odetails_id, o_id, qty, odetails_price, product_id]
      );

      // **Update Inventory**: Reduce the stock by the quantity ordered in the productDetailsTable
      await connection.query(
        `UPDATE ${productDetailsTable} SET stock = stock - ? WHERE id = ?`,
        [qty, product_id]
      );
    }

    // Get max S_ID
    [rows] = await connection.query(
      "SELECT MAX(S_ID) AS maxId FROM ORDER_SHIPPING_ADDRESS"
    );
    lastId = rows[0].maxId;
    let s_id = lastId
      ? "S" + (parseInt(lastId.slice(1)) + 1).toString().padStart(3, "0")
      : "S001";

    // Get customer address details if shipping details are not provided
    [rows] = await connection.query(
      "SELECT C_ADDRESS, C_PINCODE, C_MOBILE FROM CUSTOMER WHERE C_ID=?",
      [req.session.userId]
    );
    if (rows.length === 0) {
      throw new Error("Customer not found");
    }

    if (!s_add && !s_cno && !s_pc) {
      s_add = rows[0].C_ADDRESS;
      s_cno = rows[0].C_MOBILE;
      s_pc = rows[0].C_PINCODE;
    } else if (!s_cno) {
      s_cno = rows[0].C_MOBILE;
    }

    // Insert into ORDER_SHIPPING_ADDRESS
    await connection.query(
      "INSERT INTO ORDER_SHIPPING_ADDRESS(S_ID, S_ADDRESS, S_PINCODE, S_CONTACTNO, O_ID) VALUES(?,?,?,?,?)",
      [s_id, s_add, s_pc, s_cno, o_id]
    );

    // Delete from CART
    await connection.query("DELETE FROM CART WHERE C_ID=?", [
      req.session.userId,
    ]);

    await connection.commit(); // Commit the transaction
    res
      .status(200)
      .send({ message: "Order placed!", status: 200, orderID: o_id });
  } catch (err) {
    await connection.rollback(); // Rollback the transaction in case of error
    console.log(err);
    res.status(500).send({ message: "Error placing order" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const connection = await conn;
    let [rows] = await connection.query("SELECT * FROM ORDER_MASTER");
    res.status(200).json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error fetching orders" });
  }
};

const getOrdersByCustomerId = async (req, res) => {
  try {
    const connection = await conn;
    // Step 1: Retrieve the order details
    const orderQuery = `
      SELECT o.o_id, o.o_date, o.o_status, od.Product_id
      FROM order_master AS o
      JOIN order_details AS od ON o.o_id = od.o_id
      WHERE o.c_id = ?;
    `;
    const [orderResult] = await connection.query(orderQuery, [
      req.session.userId,
    ]);

    if (orderResult.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const productId = orderResult[0].Product_id;

    // Step 2: Dynamically fetch the views
    const viewsQuery = `
    SELECT table_name
    FROM INFORMATION_SCHEMA.views
    WHERE table_schema = 'main_project';
    `;
    const [viewsResult] = await connection.query(viewsQuery);

    if (viewsResult.length === 0) {
      throw new Error("No views found in the database");
    }

    let productDetailsTable = null;

    // Step 3: Search for the product ID in each view
    for (const view of viewsResult) {
      const checkProductIdQuery = `
      SELECT COUNT(*) AS count
      FROM ${view.TABLE_NAME}
      WHERE id = ?;
      `;
      const [result] = await connection.query(checkProductIdQuery, [productId]);
      if (result[0].count > 0) {
        productDetailsTable = view.TABLE_NAME;
        break;
      }
    }

    if (!productDetailsTable) {
      return res
        .status(404)
        .json({ message: "Product ID not found in any views" });
    }

    // Step 4: Fetch the product details
    const productQuery = `
      SELECT pd.name, pd.price, img.PATH1 as image
      FROM ${productDetailsTable} AS pd
      JOIN image AS img ON pd.id = img.product_id
      WHERE pd.id = ?;
    `;
    const [productResult] = await connection.query(productQuery, [productId]);

    if (productResult.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Combine order and product details in response
    const response = {
      o_id: orderResult[0].o_id,
      o_date: orderResult[0].o_date,
      o_status: orderResult[0].o_status,
      name: productResult[0].name,
      price: productResult[0].price,
      image: productResult[0].image.toString(),
    };
    console.log(response);

    res.json(response);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const deleteOrderById = async (req, res) => {
  const { orderId } = req.params;
  try {
    const connection = await conn;
    // Delete from ORDER_DETAILS
    await connection.query("DELETE FROM ORDER_DETAILS WHERE O_ID = ?", [
      orderId,
    ]);
    console.log("Deleted records from order details table");

    // Delete from ORDER_SHIPPING_ADDRESS
    await connection.query(
      "DELETE FROM ORDER_SHIPPING_ADDRESS WHERE O_ID = ?",
      [orderId]
    );
    console.log("Deleted records from order_shipping_address table");

    // Delete from ORDER_MASTER
    await connection.query("DELETE FROM ORDER_MASTER WHERE O_ID = ?", [
      orderId,
    ]);
    console.log("Deleted record from order master table");

    res.status(200).json({ message: "Order deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error deleting order" });
  }
};
module.exports = {
  placeOrder,
  getAllOrders,
  deleteOrderById,
  getOrdersByCustomerId,
};
