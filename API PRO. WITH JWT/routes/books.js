const express = require('express');
const {
  getExternalBooks,
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/external', getExternalBooks);
router.get('/', protect, getBooks);
router.get('/:id', protect, getBookById);
router.post('/', protect, createBook);
router.put('/:id', protect, updateBook);
router.delete('/:id', protect, deleteBook);

module.exports = router;
