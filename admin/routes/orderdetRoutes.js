const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderdetController');
// Get all orders
router.get('/orderdets', orderController.getAllOrders);

// Get detailed order information
router.get('/orderdets/:id/details', orderController.getOrderDetails);

module.exports = router;
