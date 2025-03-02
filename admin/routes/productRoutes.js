const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const multer = require('multer');
const path = require('path');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Accept multiple images for the product
const upload = multer({
    storage: storage
}).fields([
    { name: 'prod_img1', maxCount: 1 },
    { name: 'prod_img2', maxCount: 1 },
    { name: 'prod_img3', maxCount: 1 }
]);

router.get('/table/:tableName/products', productController.getProductsByTable);

router.get('/categories2', productController.getCategories);
router.get('/categories1', productController.getAllCategories);
router.get('/category/:cy_id/subcategories', productController.getSubcategories);
router.get('/subcategory/:sub_id/subsubcategories', productController.getSubSubcategories);

router.post('/add', productController.addProduct);
router.get('/get-fields', productController.getField);
router.get('/last-id', productController.lastId);
router.get('/get-primary-key', productController.getPK);

router.put('/update', productController.updateProduct);
router.delete('/delete/:tableName/:productId', productController.deleteProduct);
module.exports = router;