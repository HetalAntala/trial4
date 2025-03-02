const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/');  // Store in 'public/uploads'
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

router.post('/create-table', categoryController.createTableAndView);
router.get('/get-categories', categoryController.getAllCategories); 

router.get('/categories', categoryController.getCategories);
router.get('/subcategories/:categoryId', categoryController.getSubcategoriesByCategory);
router.get('/subsubcategories/:subcategoryId', categoryController.getSubSubcategories);

router.post('/categories', categoryController.upload.single('cy_image'), categoryController.addCategory);
router.put('/categories/:id', upload.single('cy_image'), categoryController.updateCategory);
router.put('/rcategories/:id', categoryController.removeCategory);

router.post('/subcategories', categoryController.upload.single('sub_image'), categoryController.addSubCategory);
router.put('/subcategories/:id', upload.single('sub_image'), categoryController.updateSubcategory);
router.put('/rsubcategories/:id', categoryController.removeSubCategory);


router.post('/subsubcategories', upload.single('ss_image'),categoryController.addSubSubCategory);
router.put('/subsubcategories/:id', upload.single('ss_image'),categoryController.updateSubSubcategory);
router.put('/rsubsubcategories/:id', categoryController.removeSubSubCategory);


module.exports = router;
