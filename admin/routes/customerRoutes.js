const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/', customerController.getAllCustomers);
// Update Customer Status
router.put('/:c_id', customerController.updateCustomerStatus);

module.exports = router; 