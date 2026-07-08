const express = require('express');
const router = express.Router();

// Routes for managing extra categories linked to subcategories.
const extraCategoryController = require('../controllers/extraCategoryController');
const { validate } = require('../middlewares/validate');
const { extraCategoryRules } = require('../middlewares/rules');

router.get('/', extraCategoryController.index);
router.get('/create', extraCategoryController.showCreate);
router.post('/', extraCategoryRules.create, validate, extraCategoryController.create);
router.get('/api/by-subcategory/:subcategoryId', extraCategoryController.bySubcategory);
router.get('/:id', extraCategoryController.view);
router.get('/:id/edit', extraCategoryController.showEdit);
router.put('/:id', extraCategoryRules.update, validate, extraCategoryController.update);
router.delete('/:id', extraCategoryController.destroy);

module.exports = router;
