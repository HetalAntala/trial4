const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getAllOrders,
  deleteOrderById,
  getOrdersByCustomerId
} = require("../controllers/ordercontroller");

router.post("/add", placeOrder);
router.get("/", getAllOrders);
router.delete("/orderId", deleteOrderById);
router.get("/customer/orders",getOrdersByCustomerId);

module.exports = router;
