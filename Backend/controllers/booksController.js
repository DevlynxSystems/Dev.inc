const dataBaseManager = require('../DatabaseManager');

function formatValidationError(err) {
  if (err?.name === 'ValidationError' && err?.errors) {
    return Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
  }
  return err?.message || 'Request failed';
}

async function listBooks(req, res) {
  try {
    const books = await dataBaseManager.getAllBooks();
    return res.json(books);
  } catch (err) {
    console.error('GET /api/books error:', err);
    return res.status(500).json({ error: 'Failed to fetch books' });
  }
}

async function getBookById(req, res) {
  try {
    const book = await dataBaseManager.getBookById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    return res.json(book);
  } catch (err) {
    console.error('GET /api/books/:id error:', err);
    return res.status(400).json({ error: 'Failed to fetch book' });
  }
}

async function addBook(req, res) {
  try {
    const savedBook = await dataBaseManager.addBook(req.body);
    return res.status(201).json(savedBook);
  } catch (err) {
    const message = formatValidationError(err) || 'Failed to add book';
    console.error('POST /api/books error:', message, err);
    return res.status(400).json({ error: message });
  }
}

async function updateBook(req, res) {
  try {
    const updated = await dataBaseManager.updateBook(req.params.id, req.body);
    return res.json(updated);
  } catch (err) {
    const message = formatValidationError(err) || 'Failed to update book';
    console.error(`PUT /api/books/${req.params.id} error:`, message, err);
    return res.status(message === 'Book not found' ? 404 : 400).json({ error: message });
  }
}

async function deleteBook(req, res) {
  try {
    await dataBaseManager.deleteBook(req.params.id);
    return res.status(200).json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/books/:id error:', err);
    return res.status(500).json({ error: 'Failed to delete book' });
  }
}

module.exports = {
  listBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
};

