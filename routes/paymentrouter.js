const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentcontroller"); // Ensure this path is correct

// Define routes
router.get("/:orderId", paymentController.getPaymentDetails);
router.post("/", paymentController.createPayment);
router.post('/generate-qr-code', paymentController.generateQRCodeForOrder);

module.exports = router;