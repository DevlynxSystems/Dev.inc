import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, BookOpenText, Compass, Eye, ShieldCheck, Sparkles, Layers3, Search } from 'lucide-react';
import { BookDetailsModal } from '../components/BookDetailsModal';
import { sampleBooks } from '../data/books';
import { useAuth } from '../auth/AuthContext';

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
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadFeatured() {
      if (!cancelled) setFeaturedLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/books`);
        const data = await res.json();
        if (!cancelled) {
          if (Array.isArray(data) && data.length > 0) {
            setFeaturedBooks(data.slice(0, 6));
          } else {
            // Keep the landing page populated even when catalog is empty.
            setFeaturedBooks(normalizeSampleBooks().slice(0, 6));
          }
          setFeaturedLoading(false);
        }
      } catch {
        if (!cancelled) {
          setFeaturedBooks(normalizeSampleBooks().slice(0, 6));
          setFeaturedLoading(false);
        }
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

  const visibleFeatured = featuredBooks.slice(0, 6);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  return (
    <div className="home-page landing-page mx-auto w-full max-w-[78rem] px-2 sm:px-3 md:px-4">
      <motion.section
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/30 px-4 py-12 shadow-[0_20px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:px-6 sm:py-14 md:px-10 md:py-16"
        aria-label="Hero"
      >
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl"
            animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -right-20 top-16 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl"
            animate={{ x: [0, -16, 0], y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 11, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.2),transparent_55%)]" />
        </div>

        <motion.div variants={itemVariants} className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-300/30 bg-orange-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-orange-200">
            <Sparkles className="h-3.5 w-3.5" />
            Curated reading experience
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Discover your next great read with a premium Book Catalog.
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-stone-300 sm:text-base md:text-lg">
            Browse intelligently, open rich book details instantly, and keep your library organized with role-based access built for modern teams.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <motion.button
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-orange-300/30 bg-orange-500/90 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(249,115,22,0.35)] transition hover:bg-orange-400"
              onClick={() => navigate('/catalog')}
            >
              Browse Books
              <ArrowRight className="h-4 w-4" />
            </motion.button>
            {!user && (
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-stone-100 transition hover:border-white/25 hover:bg-white/10"
                onClick={() => navigate('/signup')}
              >
                Create Account
              </motion.button>
            )}
            {user?.role === 'user' && (
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-stone-100 transition hover:border-white/25 hover:bg-white/10"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </motion.button>
            )}
            {user?.role === 'admin' && (
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-stone-100 transition hover:border-white/25 hover:bg-white/10"
                onClick={() => navigate('/admin')}
              >
                Admin Dashboard
              </motion.button>
            )}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2.5 text-xs text-stone-300">
            {['Smart browsing', 'Clean organization', 'Role-based access'].map((badge) => (
              <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {badge}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        variants={containerVariants}
        className="mt-12"
        aria-label="Overview"
      >
        <motion.div variants={itemVariants} className="mx-auto mb-8 max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-orange-300/90">Overview</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">Built for clarity, speed, and control</h2>
          <p className="mt-3 text-stone-400">A modern catalog experience that keeps reading workflows smooth from discovery to detailed viewing.</p>
        </motion.div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: 'Browse & search',
              description: 'Find books by title, author, genre, and quick filters in seconds.',
              icon: Search,
            },
            {
              title: 'View details',
              description: 'Open rich metadata, cover art, and key facts in a single click.',
              icon: Eye,
            },
            {
              title: 'Role-based access',
              description: 'Keep actions structured with user and admin permissions.',
              icon: ShieldCheck,
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl transition"
              >
                <div className="inline-flex rounded-xl border border-orange-300/30 bg-orange-500/15 p-2.5 text-orange-200 shadow-[0_0_0_1px_rgba(251,146,60,0.2)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-stone-100">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-400">{feature.description}</p>
                <div className="mt-5 h-px w-full bg-gradient-to-r from-orange-400/35 via-white/20 to-transparent opacity-0 transition group-hover:opacity-100" />
              </motion.article>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="mt-12 rounded-3xl border border-white/10 bg-black/30 px-4 py-7 backdrop-blur-xl sm:px-6 md:px-8"
        aria-label="Built for discovery"
      >
        <motion.div variants={itemVariants} className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-orange-300/90">Built for discovery</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">How readers use it in minutes</h2>
        </motion.div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Explore',
              text: 'Scan a curated collection with clear metadata and visual book covers.',
              icon: Compass,
            },
            {
              step: '02',
              title: 'Inspect',
              text: 'Open details to compare titles, authors, pages, and publication dates.',
              icon: BookOpenText,
            },
            {
              step: '03',
              title: 'Organize',
              text: 'Maintain clean catalog control with role-based account permissions.',
              icon: Layers3,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.step}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-orange-300/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.16)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-orange-300">{item.step}</span>
                  <Icon className="h-5 w-5 text-orange-200/90" />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-stone-100">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-400">{item.text}</p>
              </motion.article>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="mt-12"
        aria-label="Featured books"
      >
        <motion.div variants={itemVariants} className="mb-7 text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-orange-300/90">Featured Collection</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">Trending reads in the catalog</h2>
          <p className="mx-auto mt-3 max-w-2xl text-stone-400">A curated showcase of books users are opening and discovering right now.</p>
        </motion.div>

        {featuredLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-stone-300 backdrop-blur-xl">
            Loading featured books...
          </div>
        ) : visibleFeatured.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-stone-300 backdrop-blur-xl">
            No featured books yet. Visit the catalog to add books.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5" role="list">
            {visibleFeatured.map((book, index) => (
              <motion.article
                key={book._id || book.id}
                variants={itemVariants}
                custom={index}
                whileHover={{ y: -8 }}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_12px_35px_rgba(0,0,0,0.36)] backdrop-blur-xl transition hover:border-orange-300/30 hover:shadow-[0_20px_45px_rgba(0,0,0,0.5)]"
                role="listitem"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-stone-900 to-stone-800">
                  {book.cover ? (
                    <img
                      src={book.cover}
                      alt={`Cover: ${book.title || 'Untitled'}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-6xl font-semibold text-stone-500">
                      {(book.title || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                </div>

                <div className="p-5">
                  <h3 className="line-clamp-2 text-xl font-semibold tracking-tight text-stone-100">{book.title || 'Untitled'}</h3>
                  <p className="mt-1 text-sm text-stone-400">{book.author || 'Unknown author'}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-300">
                    {book.date && <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{new Date(book.date).getFullYear()}</span>}
                    {book.pageCount != null && <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{book.pageCount} pages</span>}
                    {book.genre && <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{book.genre}</span>}
                  </div>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-orange-300/30 bg-orange-500/10 px-3.5 py-2 text-sm font-semibold text-orange-200 transition hover:bg-orange-500/20"
                    onClick={() => {
                      rememberRecent(book);
                      setDetailsBook(book);
                    }}
                  >
                    View details
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </motion.section>

      <BookDetailsModal
        book={detailsBook}
        open={!!detailsBook}
        onClose={() => setDetailsBook(null)}
      />
    </div>
  );
}

