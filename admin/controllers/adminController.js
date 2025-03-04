const mysql = require("mysql2");

// ✅ Connect to MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Hetalsql@1405",
    database: "main_project"
});

//Delivery
// ✅ Fetch Orders (With or Without Assigned Delivery Person)
exports.getOrders = (req, res) => {
    const query = `
        SELECT 
            order_master.O_id, 
            customer.c_username AS customer_name, 
            order_master.O_status AS status, 
            order_master.payment_status,
            delivery_persons.d_name AS d_name
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
        console.log("Orders fetched:", results);
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
        "DELETE FROM deliveries WHERE O_id = ?",
        [orderId],
        (err, result) => {
            if (err) {
                console.error("Error deleting existing delivery records:", err);
                return res.status(500).json({ error: "Database error" });
            }

            db.query(
                "INSERT INTO deliveries (O_id, d_id, status) VALUES (?, ?, 'Pending')",
                [orderId, deliveryPersonId],
                (err, result) => {
                    if (err) {
                        console.error("Error assigning delivery:", err);
                        return res.status(500).json({ error: "Database error" });
                    }

                    // Optionally update order_master status or a delivery_status field
                    db.query(
                        "UPDATE order_master SET O_status = 'Shipped' WHERE O_id = ? AND O_status IN ('Processing', 'Pending')",
                        [orderId],
                        (err, result) => {
                            if (err) {
                                console.error("Error updating order status:", err);
                                return res.status(500).json({ error: "Database error" });
                            }
                            res.json({ success: true, message: "Delivery person assigned successfully" });
                        }
                    );
                }
            );
        }
    );
};

exports.unassignDelivery = (req, res) => {
    const { orderId } = req.body;

    db.query(
        "DELETE FROM deliveries WHERE O_id = ?",
        [orderId],
        (err, result) => {
            if (err) {
                console.error("Error unassigning delivery:", err);
                return res.status(500).json({ error: "Database error" });
            }

            // Optionally update order_master status
            db.query(
                "UPDATE order_master SET O_status = 'Processing' WHERE O_id = ? AND O_status = 'Shipped'",
                [orderId],
                (err, result) => {
                    if (err) {
                        console.error("Error updating order status:", err);
                        return res.status(500).json({ error: "Database error" });
                    }
                    res.json({ success: true, message: "Delivery person unassigned successfully" });
                }
            );
        }
    );
};