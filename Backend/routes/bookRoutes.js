const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const booksController = require('../controllers/booksController');

const router = express.Router();

router.get('/', booksController.listBooks);
router.get('/:id', booksController.getBookById);

router.post('/', authMiddleware, roleMiddleware('admin'), booksController.addBook);
router.put('/:id', authMiddleware, roleMiddleware('admin'), booksController.updateBook);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), booksController.deleteBook);

module.exports = router;

