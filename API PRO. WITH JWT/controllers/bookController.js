const Book = require('../models/Book');

const buildExternalBookPayload = (doc) => ({
  title: doc.title || 'Unknown title',
  author: doc.author_name?.[0] || 'Unknown author',
  isbn: doc.isbn?.[0] || '',
  description: doc.first_sentence?.[0] || 'No description available',
  category: doc.subject?.[0] || 'general',
  coverImage: doc.cover_i
    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
    : '',
  source: 'OpenLibrary',
  publishedYear: doc.first_publish_year || null
});

exports.getExternalBooks = async (req, res) => {
  try {
    const query = req.query.query || 'javascript';
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch data from OpenLibrary');
    }

    const data = await response.json();
    const books = (data.docs || []).slice(0, 10).map(buildExternalBookPayload);

    res.status(200).json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch books from the third-party API',
      error: error.message
    });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to fetch books', error: error.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, user: req.user._id });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({ success: true, book });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to fetch book', error: error.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { title, author, isbn, description, category, coverImage, publishedYear } = req.body;

    if (!title || !author) {
      return res.status(400).json({ success: false, message: 'Title and author are required' });
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      description,
      category,
      coverImage,
      publishedYear,
      user: req.user._id
    });

    res.status(201).json({ success: true, message: 'Book created successfully', book });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to create book', error: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const updateData = req.body;
    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({ success: true, message: 'Book updated successfully', book });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to update book', error: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to delete book', error: error.message });
  }
};
