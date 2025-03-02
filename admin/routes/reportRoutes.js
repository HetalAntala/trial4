const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');


router.get('/inventory-status', reportController.getInventoryStatus);

router.get('/inventory-categories', reportController.getInventoryCategories);

// router.post('/send-restock-alert', reportController.sendRestockAlert);
module.exports = router;