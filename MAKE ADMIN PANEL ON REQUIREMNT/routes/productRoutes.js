const express = require('express');
const router = express.Router();

// Routes for managing products, including image uploads.
const productController = require('../controllers/productController');
const { upload, handleUploadError } = require('../middlewares/upload');
const { validate } = require('../middlewares/validate');
const { productRules } = require('../middlewares/rules');

router.get('/', productController.index);
router.get('/create', productController.showCreate);
router.post('/', upload.single('image'), handleUploadError, productRules.create, validate, productController.create);
router.get('/:id', productController.view);
router.get('/:id/edit', productController.showEdit);
router.put('/:id', upload.single('image'), handleUploadError, productRules.update, validate, productController.update);
router.delete('/:id', productController.destroy);

module.exports = router;
