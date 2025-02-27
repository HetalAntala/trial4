const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ✅ Check if user is logged in
router.get("/check-session", (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});
// Route for Registration
router.post("/register", authController.registerUser);

// Route for Login
router.post("/login", authController.loginUser);

// Route for Forgot Password
router.post("/forgot-password", authController.forgotPassword);

// Route for Logout
router.post("/logout", authController.logoutUser);

// Check Session Route
router.get("/check-session", authController.checkSession);

module.exports = router;
