const mysql = require("mysql");
const QRCode = require("qrcode");

// MySQL connection configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hetalsql@1405",
  database: "main_project",
});

// Connect to the database
// db.connect(err => {
//   if (err) {
//     console.error('Error connecting to the database:', err);
//     return;
//   }
//   console.log('Connected to the database');
// });

const generateQRCode = async (paymentDetails) => {
  try {
    // Construct the UPI payment URL
    const qrCodeData = `upi://pay?pa=${paymentDetails.recipient}&pn=Nature's Palette&mc=&tid=${paymentDetails.orderId}&tn=${paymentDetails.purpose}&am=${paymentDetails.amount}&cu=INR`;

    const qrCodeURL = await QRCode.toDataURL(qrCodeData);
    return qrCodeURL;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};

// Controller function to handle QR code generation
exports.generateQRCodeForOrder = (req, res) => {
  const { orderId } = req.body;

  // Fetch dynamic payment details from database
  const sql = `
          SELECT 
            om.O_ID AS orderId,
            om.C_ID AS customerId,
            c.C_USERNAME AS customerName,
            od.ODETAILS_PRICE AS amount
          FROM ORDER_MASTER om
          JOIN ORDER_DETAILS od ON om.O_ID = od.O_ID
          JOIN CUSTOMER c ON om.C_ID = c.C_ID
          WHERE om.O_ID = ?
        `;

  db.query(sql, [orderId], async (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: "Order details not found" });
    }

    const paymentDetails = {
      ...result[0],
      currency: "INR", // Currency
      recipient: "mehtahardi084@okicici", // Replace with actual UPI ID
      purpose: "Purchase Payment", // Purpose of the payment
      amount: result[0].amount, // Amount fetched from the database
    };

    try {
      const qrCodeURL = await generateQRCode(paymentDetails);
      res.json({ qrCodeURL });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ error: "Error generating QR code" });
    }
  });
};

// Get payment details for an order
exports.getPaymentDetails = (req, res) => {
  const orderId = req.params.orderId;
  //   console.log(`Fetching payment details for order ID: ${orderId}`);

  const query = `SELECT 
      om.O_ID, om.O_DATE, om.O_STATUS, om.C_ID, p.PY_ID, p.PY_MODE, p.PY_TRANSACTION_ID, p.PY_DATE, p.PY_STATUS, 
      p.PY_AMOUNT, sa.S_ADDRESS, sa.S_PINCODE, sa.S_CONTACTNO, od.ODETAILS_ID, od.ODETAILS_QTY, od.ODETAILS_PRICE,
      (od.ODETAILS_QTY * od.ODETAILS_PRICE) AS Total_Product_Cost
      FROM ORDER_MASTER om LEFT JOIN PAYMENT p ON om.O_ID = p.O_ID
      LEFT JOIN ORDER_SHIPPING_ADDRESS sa ON om.O_ID = sa.O_ID
      LEFT JOIN ORDER_DETAILS od ON om.O_ID = od.O_ID
      WHERE om.O_ID = ?`;

  db.query(query, [orderId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    if (results.length === 0) {
      console.error("Order not found for ID:", orderId);
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(results[0]);
  });
};

// Create a new payment
exports.createPayment = (req, res) => {
  const { PY_MODE, PY_DATE, PY_STATUS, PY_AMOUNT, O_ID } = req.body;

  // Generate a unique transaction ID
  const PY_TRANSACTION_ID =
    "TX" + Date.now() + Math.floor(Math.random() * 1000);

  // Query to find the maximum PY_ID
  const maxIdQuery = "SELECT MAX(PY_ID) AS maxId FROM PAYMENT";

  db.query(maxIdQuery, (err, result) => {
    if (err) {
      console.error("Error fetching max PY_ID:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    let newPyId = "PY01";
    if (result[0].maxId) {
      const maxId = result[0].maxId;
      const numericPart = parseInt(maxId.slice(2), 10); // Extract numeric part of PY_ID
      const incrementedPart = (numericPart + 1).toString().padStart(2, "0"); // Increment and format with leading zeros
      newPyId = `PY${incrementedPart}`;
    }

    const insertQuery = `
        INSERT INTO PAYMENT (PY_ID, PY_MODE, PY_TRANSACTION_ID, PY_DATE, PY_STATUS, PY_AMOUNT, O_ID)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

    db.query(
      insertQuery,
      [
        newPyId,
        PY_MODE,
        PY_TRANSACTION_ID,
        PY_DATE,
        PY_STATUS,
        PY_AMOUNT,
        O_ID,
      ],
      (err, result) => {
        if (err) {
          console.error("Error executing query:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        res.status(201).json({ message: "Payment created successfully" });
      }
    );
  });
};
