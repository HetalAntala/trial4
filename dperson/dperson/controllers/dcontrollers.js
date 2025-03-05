const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

// Connect to MySQL Database
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Hetalsql@1405",
    database: "main_project",
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("✅ Connected to MySQL database");
});

// Fetch Deliveries Assigned to a Delivery Person
exports.getDeliveries = (req, res) => {
    const { d_id } = req.params;

    const query = 
        `SELECT 
                deliveries.id, deliveries.status,
                    p.PY_STATUS AS payment_status ,   
                    p.PY_MODE AS payment_mode,
                    p.PY_AMOUNT AS payment_amount   ,
                    p.PY_DATE AS payment_date,
                    p.PY_TRANSACTION_ID AS transactid,
                    customer.c_username AS customer_name, 
                    customer.C_ADDRESS AS customer_address,
                    customer.c_pincode AS customer_pincode,
                    order_master.O_date As order_date,
                    order_master.O_status AS order_status,
                    order_master.C_id,
                    deliveries.O_ID
            FROM deliveries 
            JOIN order_master ON deliveries.O_id = order_master.O_id
            JOIN customer ON order_master.C_id = customer.C_id
            LEFT JOIN payment p ON order_master.O_ID = p.O_ID`
    db.query(query, [d_id], (err, results) => {
        if (err) {
            console.error("Error fetching deliveries:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
};

// Update Delivery Status
exports.updateDeliveryStatus = (req, res) => {
    const { deliveryId, status } = req.body;

    if (!deliveryId || !status) {
        return res.status(400).json({ error: "Delivery ID and status are required" });
    }

    db.query(
        "UPDATE deliveries SET status = ? WHERE id = ?",
        [status, deliveryId],
        (err, result) => {
            if (err) {
                console.error("Error updating status:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ success: true, message: "Status updated successfully" });
        }
    );
};

// Update Payment Status
exports.updatePaymentStatus = (req, res) => {
    const { deliveryId, paymentStatus } = req.body;
    try {
        db.query(
            `UPDATE payment p
             JOIN deliveries d ON p.O_ID = d.O_ID
             SET p.PY_STATUS = ?
             WHERE d.id = ?`,
            [paymentStatus, deliveryId],
            (err, result) => {
                if (err) {
                    console.error("Error updating payment status:", err);
                    return res.status(500).json({ error: "Database error" });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: "Delivery or payment record not found" });
                }
                res.status(200).json({ success: true, message: "Payment status updated" });
            }
        );
    } catch (error) {
        console.error("Error updating payment status:", error);
        res.status(500).json({ error: "Error updating payment status" });
    }
};

exports.getTransactionId = (req, res) => {
    const { deliveryId } = req.params;
    db.query(
        `SELECT p.PY_TRANSACTION_ID AS transactionId
         FROM payment p
         JOIN deliveries d ON p.O_ID = d.O_ID
         WHERE d.id = ?`,
        [deliveryId],
        (error, result) => {
            if (error) {
                console.error("Error fetching transaction ID:", error);
                return res.status(500).send('Error fetching transaction ID');
            }
            if (!result || result.length === 0) {
                return res.status(404).send('No payment record found');
            }
            res.json(result[0]);
        }
    );
};

// dcontrollers.js
exports.verifyotp = (req, res) => {
    const { deliveryId, otp } = req.body;
    db.query(
        `SELECT p.PY_OTP
         FROM payment p
         JOIN deliveries d ON p.O_ID = d.O_ID
         WHERE d.id = ?`,
        [deliveryId],
        (error, result) => {
            if (error) {
                console.error("Error verifying OTP:", error);
                return res.status(500).send('Error verifying OTP');
            }
            if (result.length === 0) {
                return res.status(404).send('No payment record found');
            }
            const storedOtp = result[0].PY_OTP;
            if (storedOtp !== otp) {
                return res.status(400).send('Invalid OTP');
            }
            res.status(200).send('OTP verified');
        }
    );
};

// Register Delivery Person
exports.registerDeliveryPerson = async (req, res) => {
    console.log("Received Registration Data:", req.body);

    // Redirect if already logged in
    if (req.session.user) {
        return res.status(403).json({ success: false, message: "You are already logged in. Please log out to register a new account." });
    }

    const { username, email, password, cpassword, phone } = req.body;

    // Input validation
    if (!username || !email || !password || !cpassword || !phone) {
        return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    if (password !== cpassword) {
        return res.status(400).json({ success: false, message: "Passwords do not match!" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format!" });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, message: "Phone number must be 10 digits!" });
    }

    if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters long!" });
    }

    // Check if email already exists
    db.query("SELECT * FROM delivery_persons WHERE d_email = ?", [email], async (err, results) => {
        if (err) {
            console.error("Error checking email:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: "Email already registered! Please log in." });
        }

        // Hash password and insert into database
        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            db.query(
                "INSERT INTO delivery_persons (d_name, d_email, d_password, d_phone) VALUES (?, ?, ?, ?)",
                [username, email, hashedPassword, phone],
                (err, result) => {
                    if (err) {
                        console.error("Error registering delivery person:", err);
                        return res.status(500).json({ success: false, message: "Database error" });
                    }

                    // Set session flag to indicate a user has registered
                    req.session.registered = true;

                    res.json({ success: true, message: "Registration successful! Redirecting to login...", redirect: "/html/login.html" });
                }
            );
        } catch (error) {
            console.error("Error hashing password:", error);
            res.status(500).json({ success: false, message: "Server error. Please try again." });
        }
    });
};

// Login Delivery Person
exports.loginDeliveryPerson = async (req, res) => {
    console.log("Received Login Data:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    db.query("SELECT * FROM delivery_persons WHERE d_email = ?", [email], async (err, results) => {
        if (err) {
            console.error("Error fetching user:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length === 0) {
            console.log("❌ No user found with this email.");
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const user = results[0];

        console.log("Stored Hashed Password:", user.d_password);
        console.log("Entered Password:", password);

        const passwordMatch = await bcrypt.compare(password, user.d_password);
        
        if (!passwordMatch) {
            console.log("❌ Password does not match.");
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Store user in session
        req.session.user = { id: user.d_id, name: user.d_name };
        console.log("✅ Login successful for:", user.d_name);
        res.json({ success: true, message: "Login successful!", redirect: "/html/index.html", id: user.d_id });
    });
};

// Logout User
exports.logoutUser = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: "Failed to logout" });
        }
        res.clearCookie("connect.sid"); // Clear session cookie
        res.json({ success: true, message: "Logged out successfully", redirect: "/html/login.html" });
    });
};

// Check Session
exports.checkSession = (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
};
