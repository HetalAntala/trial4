const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// ✅ Fetch orders (Admin Panel)
router.get("/orders", adminController.getOrders);

// ✅ Fetch available delivery persons
router.get("/delivery-persons", adminController.getDeliveryPersons);

// ✅ Assign delivery person to an order
router.post("/assign-delivery", adminController.assignDelivery);

module.exports = router;
