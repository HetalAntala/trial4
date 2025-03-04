const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/dashboard', reportController.getDashboardData);
router.get('/inventory-categories1', reportController.getInventoryCategories);
// Report Routes
router.get('/feedback-report', reportController.getFeedbackReport);

// Inventory Routes
router.get('/inventory-status', reportController.getInventoryStatus);
router.get('/inventory-categories', reportController.getInventoryCategories);
router.get('/inventory-report', reportController.getInventoryReport);
router.get('/export-inventory-report-csv', reportController.exportInventoryReportCSV);
router.get('/export-inventory-report-pdf', reportController.exportInventoryReportPDF);

// Sales Report Routes
router.get('/sales-report', reportController.getSalesReport);
router.get('/export-sales-report-csv', reportController.exportSalesReportCSV);
router.get('/export-sales-report-pdf', reportController.exportSalesReportPDF);

// Customer Report Routes
router.get('/customer-report', reportController.getCustomerReport);
router.get('/export-customer-report-csv', reportController.exportCustomerReportCSV);
router.get('/export-customer-report-pdf', reportController.exportCustomerReportPDF);

// Order Report Routes
router.get('/order-report', reportController.getOrderReport);
router.get('/export-order-report-csv', reportController.exportOrderReportCSV);
router.get('/export-order-report-pdf', reportController.exportOrderReportPDF);

module.exports = router;