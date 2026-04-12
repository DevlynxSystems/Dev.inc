/**
 * BookDetailsModal Component
 *
 * Displays a full-screen modal preview for a selected book with
 * detailed information, animations, and action controls.
 *
 * Features:
 * - Animated modal using motion/react
 * - Book cover preview with fallback icon
 * - Displays metadata (title, author, genre, year, pages, publish date)
 * - Expandable book description (read more / less)
 * - Actions: view details, add to wishlist, edit, delete, close
 * - Click outside or close button dismisses modal
 *
 * Params
 * @param {Object} book - Selected book object
 * @param {boolean} open - Controls whether modal is visible
 * @param {function} onClose - Closes the modal
 * @param {function} [onEdit] - Opens edit flow for book
 * @param {function} [onDelete] - Deletes the book
 * @param {function} [onAddWishlist] - Adds book to wishlist
 * @param {function} [onViewDetails] - Handles deep view navigation
 *
 *
 *
 */



import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { BookOpenText, CalendarDays, FileText, Heart, Pencil, Trash2, X } from 'lucide-react'

function formatPages(n) {
  if (n == null) return null
  return Number(n).toLocaleString() + (n === 1 ? ' page' : ' pages')
}

export function BookDetailsModal({ book, open, onClose, onEdit, onDelete, onAddWishlist, onViewDetails }) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (open && book) setExpanded(false)
  }, [book?._id, open])

  if (!open || !book) return null

  const title = book.title ?? 'Untitled'
  const author = book.author ?? 'Unknown author'
  const publishDate = book.date
    ? new Date(book.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null
  const year = book.date ? new Date(book.date).getFullYear() : null
  const pages = book.pageCount ? `${book.pageCount} pages` : 'unknown length'
  const genre = book.genre || 'general fiction'
  const shortDescription = `${title} by ${author} is a ${genre.toLowerCase()} title${year ? ` published in ${year}` : ''}. It features ${pages} and is a strong pick for readers looking to explore this catalog with a modern, immersive preview experience.`

  const displayDescription = expanded ? shortDescription : `${shortDescription.slice(0, 170)}...`

  return (
    <motion.aside
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6"
      aria-hidden="false"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-xl" aria-hidden="true" />
      <motion.div
        role="dialog"
        aria-labelledby="details-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22 }}
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-black/50 shadow-[0_28px_90px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(249,115,22,0.24),transparent_40%),radial-gradient(circle_at_82%_20%,rgba(59,130,246,0.2),transparent_35%)]" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-black/45 text-stone-200 transition hover:bg-black/70"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative grid gap-6 p-5 md:grid-cols-[1fr_1.15fr] md:p-7">
          <div className="space-y-3">
            <motion.div
              whileHover={{ rotate: -1.4, y: -4 }}
              transition={{ duration: 0.25 }}
              className="relative mx-auto max-w-xs overflow-hidden rounded-2xl border border-white/15 shadow-[0_0_45px_rgba(249,115,22,0.24)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-transparent to-blue-400/10" />
              {book.cover ? (
                <img
                  src={book.cover}
                  alt={`Cover of ${title}`}
                  className="aspect-[2/3] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[2/3] w-full items-center justify-center bg-gradient-to-br from-stone-900 to-stone-800">
                  <BookOpenText className="h-16 w-16 text-stone-500" />
                </div>
              )}
            </motion.div>
            <p className="text-center text-xs uppercase tracking-[0.14em] text-stone-400">Preview panel</p>
          </div>

          <div>
            <h2 id="details-title" className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {title}
            </h2>
            <p className="mt-1 text-lg text-stone-300">{author}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {book.genre && <span className="rounded-full border border-orange-300/35 bg-orange-500/15 px-2.5 py-1 text-xs font-semibold text-orange-200">{book.genre}</span>}
              {book.date && <span className="rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-1 text-xs text-stone-200">{new Date(book.date).getFullYear()}</span>}
              {book.pageCount != null && <span className="rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-1 text-xs text-stone-200">{book.pageCount} pages</span>}
            </div>

            <dl className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
              {book.date && (
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                  <dt className="inline-flex items-center gap-2 text-stone-400">
                    <CalendarDays className="h-4 w-4" />
                    Publish date
                  </dt>
                  <dd className="text-stone-100">{publishDate}</dd>
                </div>
              )}
              {book.pageCount != null && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="inline-flex items-center gap-2 text-stone-400">
                    <FileText className="h-4 w-4" />
                    Pages
                  </dt>
                  <dd className="text-stone-100">{formatPages(book.pageCount)}</dd>
                </div>
              )}
            </dl>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm leading-6 text-stone-300">{displayDescription}</p>
              {shortDescription.length > 170 && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-orange-200 transition hover:text-orange-100"
                >
                  {expanded ? 'Read less' : 'Read more'}
                </button>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => (onViewDetails ? onViewDetails(book) : setExpanded(true))}
                className="rounded-xl border border-orange-300/35 bg-orange-500/90 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(249,115,22,0.32)] transition hover:scale-[1.02] hover:bg-orange-400"
              >
                View Details
              </button>
              <button
                type="button"
                onClick={() => (onAddWishlist ? onAddWishlist(book) : null)}
                className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-stone-100 transition hover:scale-[1.02] hover:border-white/25 hover:bg-white/[0.08]"
              >
                <Heart className="h-4 w-4" />
                Add to Wishlist
              </button>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onEdit(book)
                    onClose()
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-stone-100 transition hover:scale-[1.02] hover:border-white/25 hover:bg-white/[0.08]"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(book)}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-400/35 bg-rose-500/10 px-3 py-2.5 text-sm font-semibold text-rose-200 transition hover:scale-[1.02] hover:bg-rose-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="ml-auto rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-stone-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.aside>
  )
}