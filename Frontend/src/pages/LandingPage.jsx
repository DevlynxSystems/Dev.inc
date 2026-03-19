import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookCard } from '../components/BookCard';
import { BookDetailsModal } from '../components/BookDetailsModal';
import { ExpandableTabs } from '../components/ExpandableTabs';
import { sampleBooks } from '../data/books';
import { useAuth } from '../auth/AuthContext';

import '../components/Hero.css';
import '../components/FeaturesSection.css';

function normalizeSampleBooks() {
  // sampleBooks uses `year`; BookCard/BookDetailsModal prefer `date`.
  return sampleBooks.map((b) => ({
    ...b,
    _id: b.id,
    cover: b.coverUrl,
    date: b.year ? new Date(Number(b.year), 0, 1).toISOString() : undefined,
    pageCount: b.pageCount ?? b.pages ?? undefined,
    genre: b.genre,
  }));
}

export function LandingPage() {
  const navigate = useNavigate();
  const { API_BASE_URL, user } = useAuth();

  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [detailsBook, setDetailsBook] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadFeatured() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/books`);
        const data = await res.json();
        if (!cancelled) setFeaturedBooks(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch {
        if (!cancelled) setFeaturedBooks(normalizeSampleBooks().slice(0, 6));
      }
    }
    loadFeatured();
    return () => {
      cancelled = true;
    };
  }, [API_BASE_URL]);

  const rememberRecent = (book) => {
    if (!book?._id) return;
    const key = 'devinc_recent_books';
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    const next = [book._id, ...prev.filter((id) => id !== book._id)].slice(0, 8);
    localStorage.setItem(key, JSON.stringify(next));
  };

  return (
    <div className="home-page landing-page">
      <section className="hero" aria-label="Hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M8 7h8" />
              <path d="M8 11h8" />
            </svg>
          </div>
          <p className="hero-label">Your library</p>
          <h1 className="hero-title">Book Catalog</h1>
          <p className="hero-tagline">
            Curate and discover books in one place. Browse the catalog, view details, and keep everything organized with role-based access.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn-secondary hero-secondary" onClick={() => navigate('/catalog')}>
              Browse
            </button>
            {!user && (
              <>
                <button type="button" className="btn btn-primary hero-cta" onClick={() => navigate('/login')}>
                  Login
                </button>
                <button type="button" className="btn btn-secondary hero-secondary" onClick={() => navigate('/signup')}>
                  Signup
                </button>
              </>
            )}
            {user?.role === 'user' && (
              <button type="button" className="btn btn-primary hero-cta" onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
            )}
            {user?.role === 'admin' && (
              <button type="button" className="btn btn-primary hero-cta" onClick={() => navigate('/admin')}>
                Admin Dashboard
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="features-section" aria-label="Overview">
        <h2 className="features-heading">Overview</h2>
        <p className="features-subtitle">Quickly learn what the app does and how it works.</p>

        <ExpandableTabs
          ariaLabel="Landing overview"
          items={[
            {
              title: 'What you can do',
              content: (
                <div className="features-grid" role="list">
                  <article className="feature-card" role="listitem">
                    <div className="feature-icon" aria-hidden="true">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12h18" />
                        <path d="M3 6h18" />
                        <path d="M3 18h18" />
                      </svg>
                    </div>
                    <h3 className="feature-title">Browse & search</h3>
                    <p className="feature-desc">Find books by title, author, genre, and filters.</p>
                  </article>

                  <article className="feature-card" role="listitem">
                    <div className="feature-icon" aria-hidden="true">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                    <h3 className="feature-title">View details</h3>
                    <p className="feature-desc">Open a book to see publish date, pages, and cover.</p>
                  </article>

                  <article className="feature-card" role="listitem">
                    <div className="feature-icon" aria-hidden="true">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3 7h7l-5 4 2 7-7-4-7 4 2-7-5-4h7z" />
                      </svg>
                    </div>
                    <h3 className="feature-title">Role-based access</h3>
                    <p className="feature-desc">Users browse. Admins add, edit, and delete books. Wishlist is future-ready.</p>
                  </article>
                </div>
              ),
            },
            {
              title: 'How it works',
              content: (
                <div className="features-grid" role="list">
                  <article className="feature-card" role="listitem">
                    <div className="feature-icon" aria-hidden="true">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <path d="M20 8v6" />
                        <path d="M23 11h-6" />
                      </svg>
                    </div>
                    <h3 className="feature-title">Sign up / log in</h3>
                    <p className="feature-desc">Passwords are hashed with bcrypt and you receive a JWT token.</p>
                  </article>

                  <article className="feature-card" role="listitem">
                    <div className="feature-icon" aria-hidden="true">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m8 12 2 2 6-6" />
                      </svg>
                    </div>
                    <h3 className="feature-title">Browse the catalog</h3>
                    <p className="feature-desc">View books immediately. The UI stays fast and simple.</p>
                  </article>

                  <article className="feature-card" role="listitem">
                    <div className="feature-icon" aria-hidden="true">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 18l-4 1 1-4 12.5-11.5z" />
                      </svg>
                    </div>
                    <h3 className="feature-title">Admins manage content</h3>
                    <p className="feature-desc">Admin actions call protected endpoints using the stored token.</p>
                  </article>
                </div>
              ),
            },
          ]}
        />
      </section>

      <section className="catalog-section" aria-label="Featured books">
        <div className="catalog-section-intro">
          <h2 className="catalog-heading">Featured books</h2>
          <p className="catalog-intro">A quick look at what’s currently in the catalog.</p>
        </div>
        <div className="catalog catalog--featured" role="list">
          {featuredBooks.length === 0 ? (
            <p className="catalog-empty">Loading featured books…</p>
          ) : (
            featuredBooks.map((book) => (
              <BookCard
                key={book._id || book.id}
                book={book}
                onView={(b) => {
                  rememberRecent(b);
                  setDetailsBook(b);
                }}
              />
            ))
          )}
        </div>
      </section>

      <BookDetailsModal
        book={detailsBook}
        open={!!detailsBook}
        onClose={() => setDetailsBook(null)}
      />
    </div>
  );
}

