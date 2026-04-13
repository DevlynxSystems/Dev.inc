import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, Pencil, Search, SlidersHorizontal, Star, Trash2 } from 'lucide-react';
import { RovingTabToolbar } from '../components/RovingTabToolbar';
import { useEscapeKey, usePrefersReducedMotion } from '../lib/a11yHooks';
import { BookDetailsModal } from '../components/BookDetailsModal';
import { BookFormModal } from '../components/BookFormModal';
import { BookCardSkeletonGrid } from '../components/Skeleton';
import {
  DATE_FILTER_OPTIONS,
  SORT_OPTIONS,
  GENRE_FILTER_UNCATEGORIZED,
  buildGenreFilterList,
  filterByDateFilter,
  filterByGenre,
  sortBooks,
} from '../components/CatalogFilters';
import { useAuth } from '../auth/AuthContext';

const RECENT_KEY = 'devinc_recent_books';
const WISHLIST_KEY = 'devinc_wishlist_books';

export function CatalogPage({ searchQuery }) {
  const { user, API_BASE_URL, authFetch } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [detailsBook, setDetailsBook] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [localQuery, setLocalQuery] = useState('');

  const [sortBy, setSortBy] = useState('newest');
  const [dateFilter, setDateFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [bookToDelete, setBookToDelete] = useState(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEscapeKey(isAdmin && !!bookToDelete, () => setBookToDelete(null));

  useEffect(() => {
    let cancelled = false;
    async function fetchBooks() {
      setBooksLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/books`);
        const data = await response.json();
        if (!cancelled) setBooks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch books:', err);
        if (!cancelled) setBooks([]);
      } finally {
        if (!cancelled) setBooksLoading(false);
      }
    }
    fetchBooks();
    return () => {
      cancelled = true;
    };
  }, [API_BASE_URL]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    if (Array.isArray(saved)) setWishlistIds(saved);
  }, []);

  const rememberRecent = (book) => {
    if (!book?._id) return;
    const prev = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    const next = [book._id, ...prev.filter((id) => id !== book._id)].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const addToWishlist = (book) => {
    const id = book?._id;
    if (!id) return;
    if (wishlistIds.includes(id)) return;
    const next = [id, ...wishlistIds].slice(0, 32);
    setWishlistIds(next);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
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

  const query = `${searchQuery || ''} ${localQuery || ''}`.trim().toLowerCase();
  const searchFiltered = useMemo(() => {
    if (!query) return books;
    return books.filter(
      (b) =>
        b.title?.toLowerCase().includes(query) ||
        b.author?.toLowerCase().includes(query) ||
        (b.genre && b.genre.toLowerCase().includes(query))
    );
  }, [books, query]);

  const { genres: genreOptions, hasUncategorized } = useMemo(() => buildGenreFilterList(books), [books]);

  useEffect(() => {
    if (genreFilter === 'all') return;
    if (genreFilter === GENRE_FILTER_UNCATEGORIZED) {
      if (!hasUncategorized) setGenreFilter('all');
      return;
    }
    if (!genreOptions.includes(genreFilter)) setGenreFilter('all');
  }, [genreFilter, genreOptions, hasUncategorized]);

  const filteredBooks = useMemo(() => {
    const byGenre = filterByGenre(searchFiltered, genreFilter);
    const dateFiltered = filterByDateFilter(byGenre, dateFilter);
    return sortBooks(dateFiltered, sortBy);
  }, [searchFiltered, genreFilter, sortBy, dateFilter]);

  const firstName = (user?.name || 'Reader').split(' ')[0];
  const previewBooks = filteredBooks.slice(0, 100);

  return (
    <section id="catalog" className="mx-auto w-full max-w-[78rem] px-2 sm:px-3 md:px-4" aria-label="Catalog">
      <motion.div
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/35 p-5 shadow-[0_20px_55px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(249,115,22,0.2),transparent_40%),radial-gradient(circle_at_86%_18%,rgba(59,130,246,0.16),transparent_35%)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-orange-200/95">Your Library</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white md:text-4xl">
              Welcome back, {firstName}
            </h2>
            <p className="mt-2 text-sm text-stone-300">
              {booksLoading ? (
                <span className="inline-block h-4 w-40 animate-pulse rounded bg-white/10 align-middle" aria-hidden />
              ) : (
                <>
                  {books.length} {books.length === 1 ? 'book' : 'books'} ready to explore.
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="relative min-w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search your library..."
                aria-label="Search catalog by title, author, or genre"
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-stone-100 placeholder:text-stone-500 outline-none transition focus:border-orange-300/50 focus:ring-2 focus:ring-orange-500/20"
              />
            </label>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <SlidersHorizontal className="h-4 w-4 text-stone-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm text-stone-100 outline-none"
                aria-label="Sort books"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-stone-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {isAdmin && (
              <button type="button" className="rounded-xl border border-orange-300/35 bg-orange-500/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400" onClick={() => { setEditingBook(null); setAddModalOpen(true); }}>
                Add book
              </button>
            )}
          </div>
        </div>

        <div className="relative mt-4 space-y-3">
            <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500" id="catalog-era-label">
              Era
            </p>
            <RovingTabToolbar ariaLabel="Filter books by publication era" className="flex flex-wrap gap-2">
              {DATE_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDateFilter(opt.value)}
                  aria-pressed={dateFilter === opt.value}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition ${
                    dateFilter === opt.value
                      ? 'border-orange-300/35 bg-orange-500/15 text-orange-200'
                      : 'border-white/10 bg-white/[0.04] text-stone-300 hover:border-white/20 hover:bg-white/[0.08]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </RovingTabToolbar>
          </div>
          {(genreOptions.length > 0 || hasUncategorized) && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Genre</p>
              <RovingTabToolbar
                ariaLabel="Filter books by genre"
                className="flex max-h-[7.5rem] flex-wrap gap-2 overflow-y-auto pr-1 md:max-h-none"
              >
                <button
                  type="button"
                  onClick={() => setGenreFilter('all')}
                  aria-pressed={genreFilter === 'all'}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    genreFilter === 'all'
                      ? 'border-sky-400/40 bg-sky-500/15 text-sky-100'
                      : 'border-white/10 bg-white/[0.04] text-stone-300 hover:border-white/20 hover:bg-white/[0.08]'
                  }`}
                >
                  All genres
                </button>
                {hasUncategorized && (
                  <button
                    type="button"
                    onClick={() => setGenreFilter(GENRE_FILTER_UNCATEGORIZED)}
                    aria-pressed={genreFilter === GENRE_FILTER_UNCATEGORIZED}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      genreFilter === GENRE_FILTER_UNCATEGORIZED
                        ? 'border-sky-400/40 bg-sky-500/15 text-sky-100'
                        : 'border-white/10 bg-white/[0.04] text-stone-300 hover:border-white/20 hover:bg-white/[0.08]'
                    }`}
                  >
                    No genre
                  </button>
                )}
                {genreOptions.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenreFilter(g)}
                    aria-pressed={genreFilter === g}
                    className={`max-w-[11rem] truncate rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      genreFilter === g
                        ? 'border-sky-400/40 bg-sky-500/15 text-sky-100'
                        : 'border-white/10 bg-white/[0.04] text-stone-300 hover:border-white/20 hover:bg-white/[0.08]'
                    }`}
                    title={g}
                  >
                    {g}
                  </button>
                ))}
              </RovingTabToolbar>
            </div>
          )}
        </div>
      </motion.div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list">
        {booksLoading ? (
          <BookCardSkeletonGrid count={8} className="col-span-full !grid" />
        ) : books.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
            <p className="text-base text-stone-300">Your library is empty.</p>
            {isAdmin ? (
              <button
                type="button"
                className="mt-4 rounded-xl border border-orange-300/35 bg-orange-500/90 px-4 py-2.5 text-sm font-semibold text-white"
                onClick={() => { setEditingBook(null); setAddModalOpen(true); }}
              >
                Add your first book
              </button>
            ) : (
              <p className="mt-3 text-sm text-stone-400">
                Ask an admin to add books to the catalog.
              </p>
            )}
          </div>
        ) : filteredBooks.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-stone-300 backdrop-blur-xl">
            {query.length === 0 ? 'No books match the current filters.' : 'No books match your search.'}
          </p>
        ) : (
          previewBooks.map((book, index) => (
            <motion.article
              key={book._id}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.2,
                delay: prefersReducedMotion ? 0 : Math.min(index * 0.03, 0.25),
              }}
              whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.01 }}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_12px_30px_rgba(0,0,0,0.34)] backdrop-blur-xl transition hover:border-orange-300/30 hover:shadow-[0_0_35px_rgba(249,115,22,0.14)]"
              role="listitem"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-stone-900 to-stone-800">
                {book.cover ? (
                  <img
                    src={book.cover}
                    alt={`Cover: ${book.title || 'Untitled'}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl font-semibold text-stone-500">
                    {(book.title || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-80" />
                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-amber-300/35 bg-black/40 px-2 py-1 text-[11px] font-semibold text-amber-200">
                  <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                  {((book.title || '').length % 2 ? '4.6' : '4.8')}
                </div>

                <div className="absolute inset-x-3 bottom-3 flex translate-y-2 gap-1 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      rememberRecent(book);
                      setDetailsBook(book);
                    }}
                    className="flex-1 rounded-lg border border-white/15 bg-black/55 px-2 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/70"
                  >
                    View details
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => openEdit(book)}
                      className="rounded-lg border border-white/15 bg-black/55 px-2 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/70"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => addToWishlist(book)}
                    className={`rounded-lg border px-2 py-1.5 text-xs font-semibold backdrop-blur ${
                      wishlistIds.includes(book._id)
                        ? 'border-rose-300/40 bg-rose-500/20 text-rose-100'
                        : 'border-white/15 bg-black/55 text-white hover:bg-black/70'
                    }`}
                    title="Add to wishlist"
                  >
                    <Heart className={`h-3.5 w-3.5 ${wishlistIds.includes(book._id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-stone-100">{book.title || 'Untitled'}</h3>
                <p className="mt-1 text-sm text-stone-400">{book.author || 'Unknown author'}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {book.genre && <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-stone-200">{book.genre}</span>}
                  {book.date && <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-stone-300">{new Date(book.date).getFullYear()}</span>}
                  {book.pageCount != null && <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-stone-300">{book.pageCount} pages</span>}
                </div>
                {isAdmin && (
                  <div className="mt-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-400/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
                      onClick={() => setBookToDelete(book)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </motion.article>
          ))
        )}
      </div>

      <BookDetailsModal
        book={detailsBook}
        open={!!detailsBook}
        onClose={() => setDetailsBook(null)}
        onEdit={isAdmin ? openEdit : undefined}
        onAddWishlist={addToWishlist}
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

      <AnimatePresence>
        {isAdmin && bookToDelete && (
          <motion.aside
            className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-sm"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBookToDelete(null)}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="catalog-delete-title"
              aria-describedby="catalog-delete-desc"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="mx-auto mt-36 w-full max-w-md rounded-2xl border border-white/10 bg-black/90 p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="catalog-delete-title" className="text-lg font-semibold text-white">
                Remove book from catalog?
              </h3>
              <p id="catalog-delete-desc" className="mt-2 text-sm text-stone-300">
                <span className="font-medium text-stone-100">{bookToDelete.title || 'Untitled'}</span>
                {bookToDelete.author ? ` · ${bookToDelete.author}` : ''} will be deleted permanently. This cannot be undone.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-stone-200"
                  onClick={() => setBookToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200"
                  onClick={async () => {
                    try {
                      await removeBook(bookToDelete._id);
                      setDetailsBook((b) => (b?._id === bookToDelete._id ? null : b));
                      setEditingBook((b) => (b?._id === bookToDelete._id ? null : b));
                      setBookToDelete(null);
                    } catch (e) {
                      alert(e.message || 'Failed to delete');
                    }
                  }}
                >
                  Delete permanently
                </button>
              </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </section>
  );
}

