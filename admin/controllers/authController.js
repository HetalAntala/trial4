const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const path = require("path");

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Hetalsql@1405",
    database: "main_project",
});

con.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL database");
});

// ✅ **Register User**
exports.registerUser = async (req, res) => {
    const { username, email, password, cpassword } = req.body;

    if (!username || !email || !password || !cpassword) {
        return res.status(400).json({ error: "All fields are required" });
    }
    if (password !== cpassword) {
        return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    try {
        // ✅ Check if the email already exists before registering
        con.query("SELECT * FROM admin WHERE a_email = ?", [email], async (err, result) => {
            if (err) {
                console.error("Error checking existing user:", err);
                return res.status(500).json({ error: "Database error" });
            }

            if (result.length > 0) {
                return res.status(400).json({ error: "Email already registered. Please login." });
            }

            // ✅ Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // ✅ Insert new user into the database
            con.query(
                "INSERT INTO admin (a_username, a_email, a_password) VALUES (?, ?, ?)",
                [username, email, hashedPassword],
                (err, result) => {
                    if (err) {
                        console.error("Error registering user:", err);
                        return res.status(500).json({ error: "Database error" });
                    }

                    req.session.registered = true;  // ✅ Mark user as registered
                    res.json({ success: true, message: "User registered successfully", redirect: "html/login.html" });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error registering user", error });
    }
};

exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    con.query("SELECT * FROM admin WHERE a_email = ?", [email], async (err, results) => {
        if (err) {
            console.error("Error fetching user:", err);
            return res.status(500).json({ error: "Database error" });
        }

        // ✅ Check if user exists
        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.a_password);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        req.session.user = { id: user.a_id, username: user.a_username, email: user.a_email };

        res.json({ success: true, message: "Login successful", redirect: "html/index.html" });
    });
};

// ✅ **Forgot Password**
exports.forgotPassword = (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    con.query("UPDATE admin SET a_password = ? WHERE a_email = ?", [hashedPassword, email], (err, result) => {
        if (err) {
            console.error("Error updating password:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, message: "Password updated successfully" });
    });
};

// ✅ **Logout User**
exports.logoutUser = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: "Failed to logout" });
        }
        res.clearCookie("connect.sid"); // Clear session cookie
        res.json({ success: true, message: "Logged out successfully" });
    });
};


// ✅ **Check Session**
exports.checkSession = (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
};
