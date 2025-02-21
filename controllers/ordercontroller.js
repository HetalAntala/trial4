const mysql = require('mysql2/promise'); // Use the promise-based version

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Hardi@sql8705',
  database: 'main_project',
});

const placeOrder = async (req, res) => {
  var { s_add = null, s_pc = null, s_cno = null } = req.body;

  try {
    const connection = await conn;

    // Get the max O_ID
    let [rows] = await connection.query(
      'SELECT MAX(O_ID) AS maxId FROM ORDER_MASTER'
    );
    let lastId = rows[0].maxId;
    let o_id = lastId
      ? 'O' + (parseInt(lastId.slice(1)) + 1).toString().padStart(3, '0')
      : 'O001';

    // Insert into ORDER_MASTER
    await connection.query(
      'INSERT INTO ORDER_MASTER(O_ID,O_DATE,O_STATUS,C_ID) VALUES(?,NOW(),\'Placed\',?)',
      [o_id, req.session.userId]
    );
    console.log('Added record in order master table');

    // Get details from CART
    [rows] = await connection.query('SELECT * FROM CART WHERE C_ID=?', [
      req.session.userId,
    ]);
    if (rows.length === 0) {
      res.status(400).send('Cart is empty');
      return;
    }

    // Process each item in the cart
    for (let row of rows) {
      let { CA_ID: ca_id, CA_QTY: qty, PRODUCT_ID: product_id } = row;

      // Get the max Odetails_ID
      let [detailRows] = await connection.query(
        'SELECT MAX(Odetails_ID) AS maxId FROM ORDER_DETAILS'
      );
      let lastDetailId = detailRows[0].maxId;
      let odetails_id = lastDetailId
        ? 'OD' + (parseInt(lastDetailId.slice(2)) + 1).toString().padStart(3, '0')
        : 'OD001';

      // Get product price
      let [priceRows] = await connection.query(
        'SELECT p_price FROM plants WHERE p_id = ? UNION ALL SELECT b_price FROM bouquet WHERE b_id = ? UNION ALL SELECT pt_price FROM pots WHERE pt_id = ? UNION ALL SELECT ft_price FROM fertilizers WHERE ft_id = ? UNION ALL SELECT t_price FROM tools WHERE t_id = ?',
        [product_id, product_id, product_id, product_id, product_id]
      );
      if (priceRows.length === 0) {
        res.status(400).send('Product not found');
        return;
      }

      let p_price;
      if (priceRows[0].p_price !== undefined) {
        p_price = priceRows[0].p_price;
      } else if (priceRows[0].b_price !== undefined) {
        p_price = priceRows[0].b_price;
      } else if (priceRows[0].pt_price !== undefined) {
        p_price = priceRows[0].pt_price;
      } else if (priceRows[0].ft_price !== undefined) {
        p_price = priceRows[0].ft_price;
      } else if (priceRows[0].t_price !== undefined) {
        p_price = priceRows[0].t_price;
      }

      let odetails_price = qty * p_price;

      // Insert into ORDER_DETAILS
      await connection.query(
        'INSERT INTO ORDER_DETAILS(ODETAILS_ID,O_ID,ODETAILS_QTY,ODETAILS_PRICE,CA_ID) VALUES(?,?,?,?,?)',
        [odetails_id, o_id, qty, odetails_price, ca_id]
      );
      console.log('Added record in order details table for item:', product_id);
    }

    // Get max S_ID
    [rows] = await connection.query(
      'SELECT MAX(S_ID) AS maxId FROM ORDER_SHIPPING_ADDRESS'
    );
    lastId = rows[0].maxId;
    let s_id = lastId
      ? 'S' + (parseInt(lastId.slice(1)) + 1).toString().padStart(3, '0')
      : 'S001';

    // Get customer address details if shipping details are not provided
    [rows] = await connection.query(
      'SELECT C_ADDRESS, C_PINCODE, C_MOBILE FROM CUSTOMER WHERE C_ID=?',
      [req.session.userId]
    );
    if (rows.length === 0) {
      res.status(400).send('Customer not found');
      return;
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
      'INSERT INTO ORDER_SHIPPING_ADDRESS(S_ID, S_ADDRESS, S_PINCODE, S_CONTACTNO, O_ID) VALUES(?,?,?,?,?)',
      [s_id, s_add, s_pc, s_cno, o_id]
    );
    console.log('Record added in order_shipping_address!');

    // Delete from CART
    await connection.query('DELETE FROM CART WHERE C_ID=?', [req.session.userId]);
    console.log('Removed from cart!');

    res.status(200).send('Order placed!');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error placing order');
  }
};

const getAllOrders = async (req, res) => {
  try {
    const connection = await conn;
    let [rows] = await connection.query('SELECT * FROM ORDER_MASTER');
    res.status(200).json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching orders');
  }
};

const getOrderById = async (req, res) => {
  const { orderId } = req.params;
  try {
    const connection = await conn;
    let [rows] = await connection.query('SELECT * FROM ORDER_MASTER WHERE O_ID = ?', [orderId]);
    if (rows.length === 0) {
      res.status(404).send('Order not found');
      return;
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching order');
  }
};

const deleteOrderById = async (req, res) => {
  const { orderId } = req.params;
  try {
    const connection = await conn;
    // Delete from ORDER_DETAILS
    await connection.query('DELETE FROM ORDER_DETAILS WHERE O_ID = ?', [orderId]);
    console.log('Deleted records from order details table');

    // Delete from ORDER_SHIPPING_ADDRESS
    await connection.query('DELETE FROM ORDER_SHIPPING_ADDRESS WHERE O_ID = ?', [orderId]);
    console.log('Deleted records from order_shipping_address table');

    // Delete from ORDER_MASTER
    await connection.query('DELETE FROM ORDER_MASTER WHERE O_ID = ?', [orderId]);
    console.log('Deleted record from order master table');

    res.status(200).send('Order deleted');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error deleting order');
  }
};

const getOrdersByCustomerId = async (req, res) => {
  try {
    const connection = await conn;
    const customerId = req.session.userId; // Use the session userId to get customer-specific orders
    let [rows] = await connection.query('SELECT * FROM ORDER_MASTER JOIN ORDER_DETAILS ON ORDER_MASTER.O_ID = ORDER_DETAILS.O_ID WHERE ORDER_MASTER.C_ID = ?', [customerId]);
    if (rows.length === 0) {
      res.status(404).send('No orders found for this customer');
      return;
    }
    res.status(200).json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching customer orders');
  }
};

module.exports = { placeOrder, getAllOrders, getOrderById, deleteOrderById, getOrdersByCustomerId };
