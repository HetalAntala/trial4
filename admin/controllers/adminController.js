const mysql = require("mysql2");

// ✅ Connect to MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Hetalsql@1405",
    database: "main_project"
});

// ✅ Fetch Orders (With or Without Assigned Delivery Person)
exports.getOrders = (req, res) => {
    const query = `
        SELECT 
            order_master.O_id, 
            customer.c_username AS customer_name, 
            order_master.O_status AS status, 
            order_master.payment_status,
            delivery_persons.d_name AS delivery_person
        FROM order_master
        LEFT JOIN customer ON order_master.C_id = customer.C_id
        LEFT JOIN deliveries ON order_master.O_id = deliveries.O_id
        LEFT JOIN delivery_persons ON deliveries.d_id = delivery_persons.d_id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching orders:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
};



// ✅ Fetch Available Delivery Persons
exports.getDeliveryPersons = (req, res) => {
    db.query("SELECT d_id, d_name FROM delivery_persons", (err, results) => {
        if (err) {
            console.error("Error fetching delivery persons:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
};

// ✅ Assign a Delivery Person
exports.assignDelivery = (req, res) => {
    const { orderId, deliveryPersonId } = req.body;

    db.query(
        "INSERT INTO deliveries (O_id, d_id, status) VALUES (?, ?, 'Pending')",
        [orderId, deliveryPersonId],
        (err, result) => {
            if (err) {
                console.error("Error assigning delivery:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ success: true, message: "Delivery person assigned successfully" });
        }
    );
};
