import { useState } from 'react'
import { BookCard } from './components/BookCard'
import { BookDetailsModal } from './components/BookDetailsModal'
import { sampleBooks } from './data/books'
import './App.css'

export default function App() {
  const [books, setBooks] = useState(sampleBooks)
  const [detailsBook, setDetailsBook] = useState(null)

  const removeBook = (id) => {
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <>
      <header className="header">
        <h1 className="logo">Book Catalog</h1>
        <p className="tagline">Browse and manage your library</p>
      </header>

      <main className="main">
        <section className="catalog" role="list">
          {books.length === 0 ? (
            <p className="catalog-empty">No books in the catalog.</p>
          ) : (
            books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onView={setDetailsBook}
                onRemove={() => removeBook(book.id)}
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
    </>
  )
}
