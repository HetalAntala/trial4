const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getOrderById,
  getAllOrders,
  deleteOrderById,
  getOrdersByCustomerId
} = require("../controllers/ordercontroller");

router.post("/add", placeOrder);
router.get("/", getAllOrders);
router.get("/:orderId", getOrderById);
router.delete("/orderId", deleteOrderById);
router.get("/customer/orders",getOrdersByCustomerId);

module.exports = router;
