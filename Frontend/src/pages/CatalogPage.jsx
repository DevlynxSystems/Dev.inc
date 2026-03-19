import { useEffect, useMemo, useState } from 'react';
import { BookCard } from '../components/BookCard';
import { BookDetailsModal } from '../components/BookDetailsModal';
import { BookFormModal } from '../components/BookFormModal';
import { CatalogFilters, filterByDateFilter, sortBooks } from '../components/CatalogFilters';
import { useAuth } from '../auth/AuthContext';

const RECENT_KEY = 'devinc_recent_books';

export function CatalogPage({ searchQuery }) {
  const { user, API_BASE_URL, authFetch } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [books, setBooks] = useState([]);
  const [detailsBook, setDetailsBook] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const [sortBy, setSortBy] = useState('newest');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    async function fetchBooks() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/books`);
        const data = await response.json();
        if (!cancelled) setBooks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch books:', err);
        if (!cancelled) setBooks([]);
      }
    }
    fetchBooks();
    return () => {
      cancelled = true;
    };
  }, [API_BASE_URL]);

  const rememberRecent = (book) => {
    if (!book?._id) return;
    const prev = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    const next = [book._id, ...prev.filter((id) => id !== book._id)].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const removeBook = async (id) => {
    const res = await authFetch(`${API_BASE_URL}/api/books/${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to delete book');
    setBooks((prev) => prev.filter((b) => b._id !== id));
  };

  const saveBook = async (bookData, bookId) => {
    const isEdit = !!bookId;
    const url = isEdit ? `${API_BASE_URL}/api/books/${bookId}` : `${API_BASE_URL}/api/books`;
    const response = await authFetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData),
    });

    const text = await response.text();
    const data = text
      ? (() => {
          try {
            return JSON.parse(text);
          } catch {
            return {};
          }
        })()
      : {};

    if (!response.ok) {
      const msg =
        data.error ||
        (response.status === 413
          ? 'Cover image is too large. Try a smaller image.'
          : isEdit
            ? 'Failed to update book'
            : 'Failed to add book');
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
  };

  const openEdit = (book) => {
    setDetailsBook(null);
    setEditingBook(book);
    setAddModalOpen(false);
  };

  const query = (searchQuery || '').trim().toLowerCase();
  const searchFiltered = useMemo(() => {
    if (!query) return books;
    return books.filter(
      (b) =>
        b.title?.toLowerCase().includes(query) ||
        b.author?.toLowerCase().includes(query) ||
        (b.genre && b.genre.toLowerCase().includes(query))
    );
  }, [books, query]);

  const filteredBooks = useMemo(() => {
    const dateFiltered = filterByDateFilter(searchFiltered, dateFilter);
    return sortBooks(dateFiltered, sortBy);
  }, [searchFiltered, sortBy, dateFilter]);

  return (
    <section id="catalog" className="catalog-section" aria-label="Catalog">
      <div className="catalog-section-intro">
        <div className="catalog-section-header">
          <div>
            <h2 className="catalog-heading">Your library</h2>
            {books.length > 0 && (
              <p className="catalog-intro">
                {books.length} {books.length === 1 ? 'book' : 'books'} in your catalog.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <CatalogFilters sortBy={sortBy} dateFilter={dateFilter} onSortChange={setSortBy} onDateFilterChange={setDateFilter} />
            {isAdmin && (
              <button type="button" className="btn btn-primary" onClick={() => { setEditingBook(null); setAddModalOpen(true); }}>
                Add book
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="catalog" role="list">
        {books.length === 0 ? (
          <div className="catalog-empty-state">
            <p className="catalog-empty-state-text">Your library is empty.</p>
            {isAdmin ? (
              <button
                type="button"
                className="btn btn-primary catalog-empty-cta"
                onClick={() => { setEditingBook(null); setAddModalOpen(true); }}
              >
                Add your first book
              </button>
            ) : (
              <p className="catalog-intro" style={{ marginTop: '1rem' }}>
                Ask an admin to add books to the catalog.
              </p>
            )}
          </div>
        ) : filteredBooks.length === 0 ? (
          <p className="catalog-empty">
            {query.length === 0 ? 'No books match the current filters.' : 'No books match your search.'}
          </p>
        ) : (
          filteredBooks.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onView={(b) => {
                rememberRecent(b);
                setDetailsBook(b);
              }}
              onEdit={isAdmin ? openEdit : undefined}
              onRemove={
                isAdmin
                  ? async () => {
                      try {
                        await removeBook(book._id)
                      } catch (e) {
                        alert(e.message || 'Failed to delete')
                      }
                    }
                  : undefined
              }
            />
          ))
        )}
      </div>

      <BookDetailsModal
        book={detailsBook}
        open={!!detailsBook}
        onClose={() => setDetailsBook(null)}
        onEdit={isAdmin ? openEdit : undefined}
      />

      <BookFormModal
        open={isAdmin && (addModalOpen || !!editingBook)}
        onClose={() => {
          setAddModalOpen(false);
          setEditingBook(null);
        }}
        onSave={saveBook}
        book={editingBook}
      />
    </section>
  );
}

