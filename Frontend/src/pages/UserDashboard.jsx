import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Flame, Heart, LibraryBig, PlayCircle, Sparkles } from 'lucide-react';
import { BookDetailsModal } from '../components/BookDetailsModal';
import { sampleBooks } from '../data/books';
import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';

const RECENT_KEY = 'devinc_recent_books';
const WISHLIST_KEY = 'devinc_wishlist_books';
const PROGRESS_KEY = 'devinc_reading_progress';

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
  const [allBooks, setAllBooks] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [progressById, setProgressById] = useState({});
  const [detailsBook, setDetailsBook] = useState(null);
  const [booksLoading, setBooksLoading] = useState(true);

  const fallbackBooks = useMemo(() => normalizeSampleBooks(), []);

  const rememberRecent = (book) => {
    if (!book?._id) return;
    const key = 'devinc_recent_books';
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    const next = [book._id, ...prev.filter((id) => id !== book._id)].slice(0, 8);
    localStorage.setItem(key, JSON.stringify(next));
  };

  const firstName = (user?.name || 'Reader').split(' ')[0];

  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    const storedProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    setWishlistIds(Array.isArray(storedWishlist) ? storedWishlist : []);
    setProgressById(storedProgress && typeof storedProgress === 'object' ? storedProgress : {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBooksAndRecent() {
      setBooksLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/books`);
        const data = await res.json();
        const loadedBooks = Array.isArray(data) && data.length > 0 ? data : fallbackBooks;
        if (!cancelled) setAllBooks(loadedBooks);

        const ids = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
        if (!Array.isArray(ids) || ids.length === 0) {
          if (!cancelled) {
            setRecentBooks(loadedBooks.slice(0, 3));
            setBooksLoading(false);
          }
          return;
        }

        const byId = new Map(loadedBooks.map((b) => [b._id || b.id, b]));
        const recent = ids
          .map((id) => byId.get(id))
          .filter(Boolean)
          .slice(0, 6);

        if (!cancelled) {
          setRecentBooks(recent.length ? recent : loadedBooks.slice(0, 3));
          setBooksLoading(false);
        }
      } catch {
        if (!cancelled) {
          setAllBooks(fallbackBooks);
          setRecentBooks(fallbackBooks.slice(0, 3));
          setBooksLoading(false);
        }
      }
    }

    loadBooksAndRecent();
    return () => {
      cancelled = true;
    };
  }, [API_BASE_URL, fallbackBooks]);

  const continueReading = useMemo(() => recentBooks.slice(0, 3), [recentBooks]);

  const recentGenres = useMemo(
    () => Array.from(new Set(recentBooks.map((b) => (b.genre || '').toLowerCase()).filter(Boolean))),
    [recentBooks]
  );

  const recommended = useMemo(() => {
    const recentIds = new Set(recentBooks.map((b) => b._id || b.id));
    const primary = allBooks.filter(
      (b) =>
        !recentIds.has(b._id || b.id) &&
        recentGenres.includes((b.genre || '').toLowerCase())
    );
    const secondary = allBooks.filter((b) => !recentIds.has(b._id || b.id) && !primary.includes(b));
    return [...primary, ...secondary].slice(0, 6);
  }, [allBooks, recentBooks, recentGenres]);

  const recentlyViewed = useMemo(() => recentBooks.slice(0, 6), [recentBooks]);

  const wishlistBooks = useMemo(() => {
    const byId = new Map(allBooks.map((b) => [b._id || b.id, b]));
    return wishlistIds.map((id) => byId.get(id)).filter(Boolean);
  }, [allBooks, wishlistIds]);

  const wishlistCount = wishlistIds.length;

  const getBookProgress = (book) => {
    const id = book?._id || book?.id;
    const stored = Number(progressById[id]);
    if (Number.isFinite(stored) && stored > 0) return Math.min(100, stored);
    return 18 + (String(id || '').length % 5) * 16;
  };

  const addToWishlist = (book) => {
    const id = book?._id || book?.id;
    if (!id) return;
    if (wishlistIds.includes(id)) return;
    const next = [id, ...wishlistIds].slice(0, 24);
    setWishlistIds(next);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  };

  const bumpProgress = (book) => {
    const id = book?._id || book?.id;
    if (!id) return;
    const current = getBookProgress(book);
    const nextValue = Math.min(100, current + 12);
    const next = { ...progressById, [id]: nextValue };
    setProgressById(next);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
    rememberRecent(book);
    setDetailsBook(book);
  };

  return (
    <div className="home-page mx-auto w-full max-w-[78rem] px-2 sm:px-3 md:px-4">
      <section className="space-y-8" aria-label="User dashboard">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/35 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-7"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(249,115,22,0.22),transparent_45%)]" />
          <div className="relative grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-orange-300/90">User dashboard</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-4xl">Welcome back, {firstName}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-stone-300 md:text-base">
                Continue where you left off, discover recommendations matched to your interests, and keep your reading momentum high.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Books read', value: '--', icon: BookOpen },
                  { label: 'Currently reading', value: '--', icon: LibraryBig },
                  { label: 'Wishlist', value: '--', icon: Heart },
                  { label: 'Reading streak', value: '--', icon: Flame },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-400">{stat.label}</span>
                        <Icon className="h-4 w-4 text-orange-300" />
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-xl font-semibold text-white">{stat.value}</p>
                        <span className="rounded-full border border-orange-300/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-orange-200">
                          Soon
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-stone-400">
                Live stats will appear once the full dashboard features are enabled.
              </p>
            </div>

            <div className="rounded-2xl border border-orange-300/25 bg-gradient-to-br from-orange-500/15 to-black/20 p-4 shadow-[0_0_35px_rgba(249,115,22,0.14)]">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-200">Continue reading</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Coming soon</h3>
              <p className="mt-2 text-sm text-stone-300">
                We are building reading sessions, chapter tracking, and progress sync.
              </p>
              <div className="mt-4 h-2 w-full rounded-full bg-white/10">
                <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-orange-400 to-amber-300" />
              </div>
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-stone-300"
              >
                <PlayCircle className="h-4 w-4" />
                Continue
              </button>
            </div>
          </div>
        </motion.div>

        <ComingSoonPanel
          title="Continue Reading"
          subtitle="Progress-based reading flow, chapter checkpoints, and resume cards are coming soon."
        />

        <ComingSoonPanel
          title="Recommended for You"
          subtitle={`Personalized recommendations based on your activity are coming soon. (${recommended.length} candidate books ready)`}
        />

        <ComingSoonPanel
          title="Recently Viewed"
          subtitle={`Recently viewed history is coming soon. Your last ${recentlyViewed.length} interactions are ready for activation.`}
        />

        <ComingSoonPanel
          title="Wishlist"
          subtitle={`Wishlist features are coming soon. You currently have ${wishlistCount} saved items queued for migration.`}
        />
      </section>

      <BookDetailsModal
        book={detailsBook}
        open={!!detailsBook}
        onClose={() => setDetailsBook(null)}
      />
    </div>
  );
}

function ComingSoonPanel({ title, subtitle }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur-xl md:p-6">
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-5 py-8 text-center">
        <Sparkles className="mx-auto h-7 w-7 text-orange-300" />
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">{title}</h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-stone-400">{subtitle}</p>
        <span className="mt-4 inline-flex rounded-full border border-orange-300/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-orange-200">
          Coming soon
        </span>
      </div>
    </section>
  );
}

function DashboardShelf({ title, subtitle, books, empty, onView, onContinue, onWishlist, getBookProgress }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur-xl md:p-6">
      <div className="mb-4">
        <h3 className="text-2xl font-semibold tracking-tight text-white">{title}</h3>
        <p className="mt-1 text-sm text-stone-400">{subtitle}</p>
      </div>

      {books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-5 py-8 text-center text-sm text-stone-300">
          {empty}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <DashboardBookCard
              key={book._id || book.id}
              book={book}
              onView={onView}
              onContinue={onContinue}
              onWishlist={onWishlist}
              progress={getBookProgress ? getBookProgress(book) : null}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function DashboardBookCard({ book, onView, onContinue, onWishlist, progress }) {
  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-orange-300/30 hover:shadow-[0_0_32px_rgba(249,115,22,0.12)]"
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        {book.genre && (
          <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-stone-200">
            {book.genre}
          </span>
        )}
      </div>

      <div className="p-4">
        <h4 className="line-clamp-2 text-lg font-semibold text-white">{book.title || 'Untitled'}</h4>
        <p className="mt-1 text-sm text-stone-400">{book.author || 'Unknown author'}</p>

        {typeof progress === 'number' && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-stone-400">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onView(book)}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-stone-100 transition hover:border-white/30 hover:bg-white/10"
          >
            View
          </button>
          {onContinue && (
            <button
              type="button"
              onClick={() => onContinue(book)}
              className="rounded-lg border border-orange-300/35 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-200 transition hover:bg-orange-500/20"
            >
              Continue Reading
            </button>
          )}
          {onWishlist && (
            <button
              type="button"
              onClick={() => onWishlist(book)}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-stone-100 transition hover:border-white/30 hover:bg-white/10"
            >
              Add to Wishlist
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

