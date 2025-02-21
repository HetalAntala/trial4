const mysql = require("mysql");

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Hetalsql@1405',
  database: 'main_project',
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// admin/controllers/orderController.js

// Fetch all orders
exports.getAllOrders = (req, res) => {
    const query = `
        SELECT 
            O_id, 
            O_date, 
            O_status, 
            C_id
        FROM order_master
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.json(results);
        }
    });
};

// Fetch detailed product info for a specific order
exports.getOrderDetails = (req, res) => {
    const orderId = req.params.id;
    const query = `
        SELECT 
        od.Odetails_id,
        od.Product_id,
        od.O_Qty,
        od.O_price,
        p.P_NAME AS product_name,
        p.P_DESC AS description,
        MIN(i.PATH1) AS image,
        c.CY_NAME AS category_name
    FROM order_details od
    JOIN plants p ON od.Product_id = p.P_ID
    JOIN image i ON p.P_ID = i.PRODUCT_ID
    JOIN category c ON p.CY_ID = c.CY_ID
    WHERE od.O_id = ?
    GROUP BY od.Odetails_id, od.Product_id, od.O_Qty, od.O_price, p.P_NAME, p.P_DESC, c.CY_NAME
        
        UNION ALL
        
        SELECT 
            od.Odetails_id,
            od.Product_id,
            od.O_Qty,
            od.O_price,
            b.B_NAME AS product_name,
            b.B_DESC AS description,
            IFNULL(img.PATH1, 'default.jpg') AS image,
            c.CY_NAME AS category_name
        FROM 
            order_details od
        LEFT JOIN 
            bouquet b ON od.Product_id = b.B_ID
        LEFT JOIN 
            image img ON img.PRODUCT_ID = b.B_ID
        LEFT JOIN 
            category c ON b.CY_ID = c.CY_ID
        WHERE 
            od.O_id = ?
    `;

    db.query(query, [orderId, orderId], (err, results) => {
        if (err) {
            console.error('Error fetching order details:', err.sqlMessage);
            return res.status(500).json({ error: 'Database error', details: err.sqlMessage });
        }
        res.json(results);
    });
};
