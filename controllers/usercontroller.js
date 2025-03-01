const { sendMail } = require("./mailer");
const bcrypt = require("bcrypt");
const mysql = require("mysql");
// console.log(secret);

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hetalsql@1405",
  database: "main_project",
});

const generateCustomerId = (callback) => {
  const sql = "SELECT MAX(c_id) AS maxId FROM customer";
  conn.query(sql, (err, result) => {
    if (err) return callback(err);

    const maxId = result[0].maxId;
    let newId;

    if (maxId) {
      const numericPart = parseInt(maxId.slice(1)) + 1;
      newId = `C${String(numericPart).padStart(3, "0")}`;
    } else {
      newId = "C001";
    }

    callback(null, newId);
  });
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password, address, pincode, mobile } = req.body;

    // Check for unique email and username
    const checkUserSql =
      "SELECT * FROM customer WHERE c_email = ? OR c_username = ?";
    conn.query(checkUserSql, [email, username], async (err, result) => {
      if (err) throw err;

      if (result.length > 0) {
        return res
          .status(400)
          .json({ error: "Email or username already in use." });
      }

      // Validate pincode
      const checkPincodeSql = "SELECT * FROM area WHERE pincode = ?";
      conn.query(checkPincodeSql, [pincode], async (err, pincodeResult) => {
        if (err) throw err;

        if (pincodeResult.length === 0) {
          return res.status(400).json({ error: "Invalid pincode." });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate new customer ID
        generateCustomerId((err, newId) => {
          if (err)
            return res
              .status(500)
              .json({ error: "Error generating customer ID." });

          // Create a new user
          const insertUserSql =
            "INSERT INTO customer (c_id, c_username, c_email, c_password, c_address, c_pincode, c_mobile) VALUES (?, ?, ?, ?, ?, ?, ?)";
          conn.query(
            insertUserSql,
            [newId, username, email, hashedPassword, address, pincode, mobile],
            (err, result) => {
              if (err) throw err;

              // Send welcome email
              sendMail(
                email,
                "Welcome to Nature's Palette",
                `Hello ${username},\n\nThank you for registering with us! We're glad to have you on board.\n\nBest regards,\nThe Team`
              );

              res
                .status(201)
                .json({ message: "User registered successfully!" });
            }
          );
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Error registering user: " + error.message });
  }
};

const loginUser = (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT c_id, c_password FROM customer WHERE c_email = ?";

  conn.query(sql, [email], async (err, result) => {
    if (err) {
      console.error("Database query error: ", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = result[0];
    const validPassword = await bcrypt.compare(password, user.c_password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    req.session.userId = user.c_id;
    res.status(200).json({ message: "Login successful", redirectUrl: "/" });
  });
};

// Get User Profile
const getUserProfile = (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ error: "Please login to access this information." });
  }

  const sql =
    "SELECT c.c_username, c.c_email,c.c_address,c.c_pincode,c.c_mobile,a.city,a.PostOfficeName FROM customer c JOIN area a ON c.c_pincode = a.pincode WHERE c.c_id = ?;";
  conn.query(sql, [req.session.userId], (err, result) => {
    if (err) throw err;
    res.status(200).json(result[0]);
  });
};

// Update User Profile
const updateUserProfile = (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ message: "Please login to update your profile." });
  }

  const { username, email, address, pincode, mobile } = req.body;

  const connection = conn; // Assuming conn is a valid database connection

  // Fetch current profile data
  const sql =
    "SELECT c_username, c_email, c_address, c_pincode, c_mobile FROM customer WHERE c_id = ?";
  connection.query(sql, [req.session.userId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching user profile." });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "User  not found." });
    }

    const currentProfile = rows[0];

    // Use existing values if new values are not provided
    const updatedUsername = username || currentProfile.c_username;
    const updatedEmail = email || currentProfile.c_email;
    const updatedAddress = address || currentProfile.c_address;
    const updatedPincode = pincode || currentProfile.c_pincode;
    const updatedMobile = mobile || currentProfile.c_mobile;

    // Update profile data
    const updateSql =
      "UPDATE customer SET c_username = ?, c_email = ?, c_address = ?, c_pincode = ?, c_mobile = ? WHERE c_id = ?";
    connection.query(
      updateSql,
      [
        updatedUsername,
        updatedEmail,
        updatedAddress,
        updatedPincode,
        updatedMobile,
        req.session.userId,
      ],
      (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json({ message: "Error updating profile." });
        }

        res.status(200).json({ message: "Profile updated successfully." });
      }
    );
  });
};
const updatePassword = (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ message: "Please login to update your password." });
  }

  const { currentPassword, newPassword, confirmPassword } = req.body;
  // Check if new password and confirm password match
  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "New password and confirm password do not match." });
  }

  const connection = conn; // Assuming conn is a valid database connection

  // Fetch current password hash
  const sql = "SELECT c_password FROM customer WHERE c_id = ?";
  connection.query(sql, [req.session.userId], async (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching user data." });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const currentPasswordHash = rows[0].c_password;

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, currentPasswordHash);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    const updateSql = "UPDATE customer SET c_password = ? WHERE c_id = ?";
    connection.query(
      updateSql,
      [newPasswordHash, req.session.userId],
      (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json({ message: "Error updating password." });
        }

        res.status(200).json({ message: "Password updated successfully." });
      }
    );
  });
};

// Logout User
const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Error logging out." });
    res.status(200).json({ message: "Logout successful." });
  });
};

const verifyPassword = (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT c_password FROM customer WHERE c_email = ?";

  conn.query(sql, [email], async (err, result) => {
    if (err) {
      console.error("Database query error: ", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = result[0];
    const validPassword = await bcrypt.compare(password, user.c_password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    res.status(200).json({ message: "Password verified successfully" });
  });
};

// Forgot Password
const forgotPassword = (req, res) => {
  const { email } = req.body;

  // Validate email exists in the database
  const sql = "SELECT C_ID FROM customer WHERE C_EMAIL = ?";
  conn.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Database query error: ", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: "Email not found." });
    }

    // Send the password reset email
    const resetLink = `http://localhost:4000/user/reset-password?email=${email}`;
    sendMail(
      email,
      "Password Reset Request",
      `Hello,\n\nPlease click the following link to reset your password: ${resetLink}\n\nBest regards,\nThe Team`
    );

    res.json({ message: "Password reset email sent." });
  });
};

// Reset Password
const resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  // Update the password in the database
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updateSql = "UPDATE customer SET C_PASSWORD = ? WHERE C_EMAIL = ?";

  conn.query(updateSql, [hashedPassword, email], (err) => {
    if (err) {
      console.error("Error updating password: ", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.status(200).json({
      message:
        "Password reset successful! Please log in with your new password.",
    });
  });
};

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  getUserProfile,
  logoutUser,
  updatePassword,
  verifyPassword,
  forgotPassword,
  resetPassword,
};
