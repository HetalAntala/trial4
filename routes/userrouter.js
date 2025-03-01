const express = require("express");
const router = express.Router();
const userController = require("../controllers/usercontroller");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/profile", userController.getUserProfile);
router.put("/profile", userController.updateUserProfile);
router.put("/password", userController.updatePassword);
router.post("/logout", userController.logoutUser);
router.post("/verify-password", userController.verifyPassword);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

module.exports = router;
