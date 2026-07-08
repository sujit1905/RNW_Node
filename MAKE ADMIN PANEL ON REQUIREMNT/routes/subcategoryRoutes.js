const express = require('express');
const router = express.Router();

// Routes for managing subcategories under each category.
const subcategoryController = require('../controllers/subcategoryController');
const { validate } = require('../middlewares/validate');
const { subcategoryRules } = require('../middlewares/rules');

router.get('/', subcategoryController.index);
router.get('/create', subcategoryController.showCreate);
router.post('/', subcategoryRules.create, validate, subcategoryController.create);
router.get('/api/by-category/:categoryId', subcategoryController.byCategory);
router.get('/:id', subcategoryController.view);
router.get('/:id/edit', subcategoryController.showEdit);
router.put('/:id', subcategoryRules.update, validate, subcategoryController.update);
router.delete('/:id', subcategoryController.destroy);

module.exports = router;
