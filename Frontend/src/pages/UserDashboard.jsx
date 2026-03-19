import { useEffect, useMemo, useState } from 'react';
import { BookCard } from '../components/BookCard';
import { BookDetailsModal } from '../components/BookDetailsModal';
import { sampleBooks } from '../data/books';
import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';

const RECENT_KEY = 'devinc_recent_books';

function normalizeSampleBooks() {
  return sampleBooks.map((b) => ({
    ...b,
    _id: b.id,
    cover: b.coverUrl,
    date: b.year ? new Date(Number(b.year), 0, 1).toISOString() : undefined,
    genre: b.genre,
    pageCount: b.pageCount ?? undefined,
  }));
}

export function UserDashboard() {
  const { user, API_BASE_URL } = useAuth();
  const [recentBooks, setRecentBooks] = useState([]);
  const [detailsBook, setDetailsBook] = useState(null);
  const [totalBooks, setTotalBooks] = useState(null);
  const [booksLoading, setBooksLoading] = useState(true);

  const displayBooks = useMemo(() => {
    if (recentBooks.length > 0) return recentBooks;
    return normalizeSampleBooks().slice(0, 6);
  }, [recentBooks]);

  const rememberRecent = (book) => {
    if (!book?._id) return;
    const key = 'devinc_recent_books';
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    const next = [book._id, ...prev.filter((id) => id !== book._id)].slice(0, 8);
    localStorage.setItem(key, JSON.stringify(next));
  };

  const hasRecent = recentBooks.length > 0;

  useEffect(() => {
    let cancelled = false;

    async function loadRecent() {
      try {
        const ids = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
        if (!Array.isArray(ids) || ids.length === 0) {
          if (!cancelled) setRecentBooks([]);
          return;
        }

        const books = await Promise.all(
          ids.slice(0, 6).map(async (id) => {
            const res = await fetch(`${API_BASE_URL}/api/books/${id}`);
            if (!res.ok) return null;
            return res.json();
          })
        );

        if (!cancelled) setRecentBooks(books.filter(Boolean));
      } catch {
        if (!cancelled) setRecentBooks([]);
      }
    }

    loadRecent();
    return () => {
      cancelled = true;
    };
  }, [API_BASE_URL]);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setBooksLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/books`);
        const data = await res.json();
        if (!cancelled) setTotalBooks(Array.isArray(data) ? data.length : 0);
      } catch {
        if (!cancelled) setTotalBooks(0);
      } finally {
        if (!cancelled) setBooksLoading(false);
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [API_BASE_URL]);

  return (
    <div className="home-page">
      <section className="catalog-section" aria-label="User dashboard">
        <div className="catalog-section-intro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h2 className="catalog-heading">Welcome, {user?.name || 'there'}!</h2>
            <p className="catalog-intro">
              Browse the catalog, open books for details, and keep your reading journey organized.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/catalog" className="btn btn-secondary">
              Browse catalog
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              Setup profile
            </Link>
          </div>
        </div>

        <section aria-label="Stats" className="catalog-filters">
          <div className="catalog-filter-group">
            <span className="catalog-filter-label">Books in catalog</span>
            <span style={{ fontWeight: 700 }}>{booksLoading ? '—' : totalBooks ?? '—'}</span>
          </div>
          <div className="catalog-filter-group">
            <span className="catalog-filter-label">Wishlist items</span>
            <span style={{ fontWeight: 700 }}>0</span>
          </div>
        </section>

        <section aria-label="Recently viewed" style={{ marginTop: '1.5rem' }}>
          <div className="catalog-section-intro" style={{ marginBottom: '0.75rem' }}>
            <h3 className="catalog-heading" style={{ fontSize: '1.25rem' }}>
              {hasRecent ? 'Recently viewed' : 'Sample books'}
            </h3>
            <p className="catalog-intro">
              {hasRecent ? 'A quick preview of what you opened last.' : 'Explore a few picks to get started.'}
            </p>
          </div>
          <div className="catalog" role="list">
            {displayBooks.map((book) => (
              <BookCard
                key={book._id || book.id}
                book={book}
                onView={(b) => {
                  rememberRecent(b);
                  setDetailsBook(b);
                }}
              />
            ))}
          </div>
        </section>

        <section aria-label="Wishlist preview" style={{ marginTop: '1.5rem' }}>
          <div className="catalog-empty-state" style={{ padding: '2rem' }}>
            <h3 className="catalog-heading" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              Wishlist
            </h3>
            <p className="catalog-intro" style={{ marginBottom: '1.25rem' }}>
              Wishlist support is coming soon. For now, enjoy browsing and viewing details.
            </p>
            <button type="button" className="btn btn-secondary" disabled aria-disabled="true">
              Add to wishlist (soon)
            </button>
          </div>
        </section>
      </section>

      <BookDetailsModal
        book={detailsBook}
        open={!!detailsBook}
        onClose={() => setDetailsBook(null)}
      />
    </div>
  );
}

