import { useState, useEffect } from 'react'
import { BookCard } from './components/BookCard'
import { BookDetailsModal } from './components/BookDetailsModal'
import { BookFormModal } from './components/BookFormModal'
import { Navbar } from './components/Navbar'
import { sampleBooks } from './data/books'
import './App.css'

export default function App() {
  const [books, setBooks] = useState([]) // Start empty

useEffect(() => {
  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/books')
      const data = await response.json()
      setBooks(data)
    } catch (err) {
      console.error("Failed to fetch books:", err)
    }
  }
  fetchBooks()
}, [])

  const [detailsBook, setDetailsBook] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const removeBook = async (id) => {
    await fetch(`http://localhost:5000/api/books/${id}`, { method: 'DELETE' });
    setBooks((prev) => prev.filter((b) => b._id !== id));
  }

  const addBook = async (bookData) => {
    const response = await fetch('http://localhost:5000/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData),
    });
    const savedBook = await response.json();
    setBooks((prev) => [savedBook, ...prev]);
    setAddModalOpen(false);
  }

  const query = searchQuery.trim().toLowerCase()
  const filteredBooks = query
    ? books.filter(
        (b) =>
          b.title?.toLowerCase().includes(query) ||
          b.author?.toLowerCase().includes(query) ||
          (b.genre && b.genre.toLowerCase().includes(query))
      )
    : books

  return (
    <div className="app-layout">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddBook={() => setAddModalOpen(true)}
      />
      <main className="main">
        <section className="catalog" role="list">
          {books.length === 0 ? (
            <p className="catalog-empty">No books in the catalog.</p>
          ) : filteredBooks.length === 0 ? (
            <p className="catalog-empty">No books match your search.</p>
          ) : (
            filteredBooks.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onView={setDetailsBook}
                onRemove={() => removeBook(book._id)}
              />
            ))
          )}
        </section>
      </main>

      <BookDetailsModal
        book={detailsBook}
        open={!!detailsBook}
        onClose={() => setDetailsBook(null)}
      />

      <BookFormModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={addBook}
      />
    </div>
  )
}
