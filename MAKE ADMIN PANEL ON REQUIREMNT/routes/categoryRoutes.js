const express = require('express');
const router = express.Router();

// Routes for managing product categories.
const categoryController = require('../controllers/categoryController');
const { validate } = require('../middlewares/validate');
const { categoryRules } = require('../middlewares/rules');

router.get('/', categoryController.index);
router.get('/create', categoryController.showCreate);
router.post('/', categoryRules.create, validate, categoryController.create);
router.get('/:id', categoryController.view);
router.get('/:id/edit', categoryController.showEdit);
router.put('/:id', categoryRules.update, validate, categoryController.update);
router.delete('/:id', categoryController.destroy);

module.exports = router;
