import { useState, useEffect } from 'react'
import { BookCard } from './components/BookCard'
import { BookDetailsModal } from './components/BookDetailsModal'
import { BookFormModal } from './components/BookFormModal'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { SuggestionsSection } from './components/SuggestionsSection'
import { CatalogFilters, filterByDateFilter, sortBooks } from './components/CatalogFilters'
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
  const [editingBook, setEditingBook] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [dateFilter, setDateFilter] = useState('all')

  const removeBook = async (id) => {
    await fetch(`http://localhost:5000/api/books/${id}`, { method: 'DELETE' });
    setBooks((prev) => prev.filter((b) => b._id !== id));
  }

  const saveBook = async (bookData, bookId) => {
    const isEdit = !!bookId
    const url = isEdit ? `http://localhost:5000/api/books/${bookId}` : 'http://localhost:5000/api/books'
    const response = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData),
    });
    const text = await response.text();
    const data = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};
    if (!response.ok) {
      const msg = data.error || (response.status === 413 ? 'Cover image is too large. Try a smaller image.' : (isEdit ? 'Failed to update book' : 'Failed to add book'));
      throw new Error(msg);
    }
    if (isEdit) {
      setBooks((prev) => prev.map((b) => (b._id === bookId ? data : b)));
      setEditingBook(null);
      setDetailsBook(null);
    } else {
      setBooks((prev) => [data, ...prev]);
      setAddModalOpen(false);
    }
  }

  const openEdit = (book) => {
    setDetailsBook(null)
    setEditingBook(book)
  }

  const query = searchQuery.trim().toLowerCase()
  const searchFiltered = query
    ? books.filter(
        (b) =>
          b.title?.toLowerCase().includes(query) ||
          b.author?.toLowerCase().includes(query) ||
          (b.genre && b.genre.toLowerCase().includes(query))
      )
    : books
  const dateFiltered = filterByDateFilter(searchFiltered, dateFilter)
  const filteredBooks = sortBooks(dateFiltered, sortBy)

  return (
    <div className="app-layout">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddBook={() => setAddModalOpen(true)}
      />
      <main className="main">
        <SuggestionsSection
          books={books}
          onView={setDetailsBook}
          onEdit={openEdit}
          onRemove={removeBook}
        />
        <section id="catalog" className="catalog-section" aria-label="All books">
          <div className="catalog-section-header">
            <h2 className="catalog-heading">All books</h2>
            <CatalogFilters
              sortBy={sortBy}
              dateFilter={dateFilter}
              onSortChange={setSortBy}
              onDateFilterChange={setDateFilter}
            />
          </div>
          <div className="catalog" role="list">
          {books.length === 0 ? (
            <p className="catalog-empty">No books in the catalog.</p>
          ) : filteredBooks.length === 0 ? (
            <p className="catalog-empty">
              {searchFiltered.length === 0 ? 'No books match your search.' : 'No books match the current filters.'}
            </p>
          ) : (
            filteredBooks.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onView={setDetailsBook}
                onEdit={openEdit}
                onRemove={() => removeBook(book._id)}
              />
            ))
          )}
          </div>
        </section>
      </main>

      <Footer />

      <BookDetailsModal
        book={detailsBook}
        open={!!detailsBook}
        onClose={() => setDetailsBook(null)}
        onEdit={openEdit}
      />

      <BookFormModal
        open={addModalOpen || !!editingBook}
        onClose={() => { setAddModalOpen(false); setEditingBook(null) }}
        onSave={saveBook}
        book={editingBook}
      />
    </div>
  )
}
