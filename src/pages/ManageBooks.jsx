import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Download, Eye, Pencil, Search, Trash2, Upload } from 'lucide-react'
import { BookFormModal } from '../components/BookFormModal'
import { BookDetailsModal } from '../components/BookDetailsModal'
import { useAuth } from '../auth/AuthContext'
import { AdminLayout } from '../components/AdminLayout'
import { logAdminEvent } from '../lib/adminAudit'
import { ManageBooksTableSkeleton } from '../components/Skeleton'

export function ManageBooks() {
  const { API_BASE_URL, authFetch } = useAuth()

  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [genreFilter, setGenreFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedIds, setSelectedIds] = useState([])
  const [activeBook, setActiveBook] = useState(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10
  const [detailsBook, setDetailsBook] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [bookToDelete, setBookToDelete] = useState(null)

  const loadBooks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/books`)
      const data = await res.json()
      setBooks(Array.isArray(data) ? data : [])
      logAdminEvent({ type: 'books.refresh', message: 'Refreshed books list', meta: { count: Array.isArray(data) ? data.length : 0 } })
    } catch {
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBooks().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL])

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 250)
    return () => clearTimeout(t)
  }, [searchInput])

  const removeBook = async (id) => {
    const res = await authFetch(`${API_BASE_URL}/api/books/${id}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Failed to delete book')
    setBooks((prev) => prev.filter((b) => b._id !== id))
    logAdminEvent({ type: 'books.delete', message: `Deleted book ${id}`, meta: { id } })
  }

  const saveBook = async (bookData, bookId) => {
    const isEdit = !!bookId
    const url = isEdit ? `${API_BASE_URL}/api/books/${bookId}` : `${API_BASE_URL}/api/books`

    const response = await authFetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData),
    })

    const text = await response.text()
    const data = text
      ? (() => {
          try {
            return JSON.parse(text)
          } catch {
            return {}
          }
        })()
      : {}

    if (!response.ok) {
      const msg =
        data.error ||
        (response.status === 413
          ? 'Cover image is too large. Try a smaller image.'
          : isEdit
            ? 'Failed to update book'
            : 'Failed to add book')
      throw new Error(msg)
    }

    if (isEdit) {
      setBooks((prev) => prev.map((b) => (b._id === bookId ? data : b)))
      setEditingBook(null)
      setDetailsBook(null)
      logAdminEvent({ type: 'books.edit', message: `Updated book ${data.title || bookId}`, meta: { id: bookId } })
    } else {
      setBooks((prev) => [data, ...prev])
      setAddModalOpen(false)
      logAdminEvent({ type: 'books.add', message: `Added new book ${data.title || 'Untitled'}`, meta: { id: data._id } })
    }
  }

  const openEdit = (book) => {
    setDetailsBook(null)
    setEditingBook(book)
    setAddModalOpen(false)
  }

  const genreOptions = useMemo(() => {
    const set = new Set()
    books.forEach((b) => {
      const g = (b.genre && String(b.genre).trim()) || ''
      if (g) set.add(g)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  }, [books])

  const filteredBooks = books
    .filter((b) => {
      const q = search.trim().toLowerCase()
      if (dateFilter === 'recent' && new Date(b.date || 0).getFullYear() < 2000) return false
      if (dateFilter === 'classic' && new Date(b.date || 0).getFullYear() >= 1980) return false
      if (genreFilter !== 'all') {
        const g = (b.genre || '').trim().toLowerCase()
        if (g !== genreFilter.trim().toLowerCase()) return false
      }
      if (!q) return true
      return (
        (b.title || '').toLowerCase().includes(q) ||
        (b.author || '').toLowerCase().includes(q) ||
        (b.genre || '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '')
      if (sortBy === 'author') return (a.author || '').localeCompare(b.author || '')
      return new Date(b.date || 0) - new Date(a.date || 0)
    })

  const pagedBooks = filteredBooks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [search, sortBy, dateFilter, genreFilter])

  const toggleSelected = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBooks.length) {
      setSelectedIds([])
      return
    }
    setSelectedIds(filteredBooks.map((b) => b._id))
  }

  const bulkDelete = async () => {
    if (!selectedIds.length) return
    if (!confirm(`Delete ${selectedIds.length} selected books?`)) return
    for (const id of selectedIds) {
      // eslint-disable-next-line no-await-in-loop
      await authFetch(`${API_BASE_URL}/api/books/${id}`, { method: 'DELETE' }).catch(() => {})
    }
    setBooks((prev) => prev.filter((b) => !selectedIds.includes(b._id)))
    setSelectedIds([])
    logAdminEvent({ type: 'books.bulk-delete', message: `Deleted ${selectedIds.length} books`, meta: { count: selectedIds.length } })
  }

  const bulkExport = () => {
    const rows = filteredBooks.filter((b) => selectedIds.includes(b._id))
    const header = ['_id', 'title', 'author', 'genre', 'date', 'pageCount']
    const csv = [
      header.join(','),
      ...rows.map((r) => header.map((k) => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'books-export.csv'
    a.click()
    URL.revokeObjectURL(url)
    logAdminEvent({ type: 'books.export', message: `Exported ${rows.length} books`, meta: { count: rows.length } })
  }

  const importCsv = async (file) => {
    const text = await file.text()
    const lines = text.split(/\r?\n/).filter(Boolean)
    if (lines.length < 2) return
    const header = lines[0].split(',').map((s) => s.replace(/"/g, '').trim())
    const rows = lines.slice(1).map((line) => {
      const vals = line.split(',').map((s) => s.replace(/^"|"$/g, '').replace(/""/g, '"'))
      return Object.fromEntries(header.map((h, i) => [h, vals[i] ?? '']))
    })
    const normalized = rows.map((r) => ({
      title: r.title || 'Untitled',
      author: r.author || 'Unknown author',
      genre: r.genre || '',
      pageCount: Number(r.pageCount) || 0,
      date: r.date ? new Date(r.date) : new Date(),
      cover: null,
    }))
    for (const payload of normalized) {
      // eslint-disable-next-line no-await-in-loop
      await authFetch(`${API_BASE_URL}/api/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {})
    }
    await loadBooks()
    logAdminEvent({ type: 'books.import', message: `Imported ${normalized.length} books from CSV`, meta: { count: normalized.length } })
  }

  return (
    <AdminLayout title="Manage Books">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="relative min-w-64 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search title, author, genre..."
            className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-stone-100 placeholder:text-stone-500 outline-none transition focus:border-orange-300/50 focus:ring-2 focus:ring-orange-500/20"
          />
        </label>
        <select className="h-11 max-w-[11rem] rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-stone-100" value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)} aria-label="Filter by genre">
          <option value="all">All genres</option>
          {genreOptions.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-stone-100" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="title">Title</option>
          <option value="author">Author</option>
        </select>
        <select className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-stone-100" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
          <option value="all">All dates</option>
          <option value="recent">Recent (2000+)</option>
          <option value="classic">Classic (&lt;1980)</option>
        </select>
        <label className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-stone-200 hover:bg-white/[0.08]">
          <Upload className="h-4 w-4" />
          Import CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) importCsv(file).catch(() => {})
              e.target.value = ''
            }}
          />
        </label>
        <button type="button" className="rounded-xl border border-orange-300/35 bg-orange-500/90 px-4 py-2.5 text-sm font-semibold text-white" onClick={() => { setEditingBook(null); setAddModalOpen(true) }}>
          Add book
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-orange-300/35 bg-orange-500/10 px-3 py-2">
          <p className="text-sm text-orange-200">{selectedIds.length} selected</p>
          <div className="flex gap-2">
            <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs text-stone-100" onClick={bulkExport}>
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-rose-400/35 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-200" onClick={bulkDelete}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
      )}

      <section aria-label="Book management">
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
          <table className="w-full min-w-[980px] border-collapse">
            <thead>
              <tr className="sticky top-0 z-10 bg-black/60 backdrop-blur-xl">
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">
                  <input type="checkbox" checked={filteredBooks.length > 0 && selectedIds.length === filteredBooks.length} onChange={toggleSelectAll} />
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">Cover</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">Title / Genre</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">Author</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">Published</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">Pages</th>
                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <ManageBooksTableSkeleton rows={8} />
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-3 py-5 text-sm text-stone-400">
                    No books in the catalog yet.
                  </td>
                </tr>
              ) : (
                pagedBooks.map((book) => (
                  <motion.tr
                    key={book._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="cursor-pointer border-t border-white/10 odd:bg-white/[0.02] even:bg-transparent transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
                    onClick={() => setActiveBook(book)}
                  >
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.includes(book._id)} onChange={() => toggleSelected(book._id)} />
                    </td>
                    <td className="px-3 py-3">
                      {book.cover ? (
                        <img
                          src={book.cover}
                          alt={`Cover: ${book.title}`}
                          className="h-16 w-12 rounded-md border border-white/10 object-cover transition duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="h-16 w-12 rounded-md border border-white/10 bg-white/10" />
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-stone-100">{book.title || 'Untitled'}</p>
                      <p className="mt-1 text-xs text-stone-400">{book.genre || 'No genre'}</p>
                    </td>
                    <td className="px-3 py-3 text-stone-200">{book.author || 'Unknown author'}</td>
                    <td className="px-3 py-3 text-stone-400">
                      {book.date ? new Date(book.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '—'}
                    </td>
                    <td className="px-3 py-3 text-stone-400">{book.pageCount != null ? book.pageCount : '—'}</td>
                    <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button type="button" title="View" className="rounded-lg border border-white/10 bg-white/[0.05] p-2 text-stone-200 hover:bg-white/[0.1]" onClick={() => setDetailsBook(book)}>
                          <Eye className="h-4 w-4" />
                        </button>
                        <button type="button" title="Edit" className="rounded-lg border border-white/10 bg-white/[0.05] p-2 text-stone-200 hover:bg-white/[0.1]" onClick={() => openEdit(book)}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-2 text-rose-200 hover:bg-rose-500/20"
                          onClick={() => setBookToDelete(book)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      <div className="mt-3 flex items-center justify-between text-sm text-stone-400">
        <p>Showing {pagedBooks.length} of {filteredBooks.length} books</p>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Prev
          </button>
          <span>Page {page} / {totalPages}</span>
          <button type="button" className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 disabled:opacity-50" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      </div>

      <AnimatePresence>
        {activeBook && (
          <motion.aside
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveBook(null)}
          >
            <motion.div
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full w-full max-w-md border-l border-white/10 bg-black/85 p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white">{activeBook.title || 'Untitled'}</h3>
              <p className="mt-1 text-sm text-stone-400">{activeBook.author || 'Unknown author'}</p>
              <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-3">
                {activeBook.cover ? (
                  <img src={activeBook.cover} alt={`Cover: ${activeBook.title}`} className="mx-auto h-56 w-40 rounded-md object-cover" />
                ) : (
                  <div className="mx-auto h-56 w-40 rounded-md bg-white/10" />
                )}
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-stone-300"><span className="text-stone-500">Genre:</span> {activeBook.genre || '—'}</p>
                <p className="text-stone-300"><span className="text-stone-500">Published:</span> {activeBook.date ? new Date(activeBook.date).toLocaleDateString() : '—'}</p>
                <p className="text-stone-300"><span className="text-stone-500">Pages:</span> {activeBook.pageCount ?? '—'}</p>
              </div>
              <div className="mt-6 flex gap-2">
                <button type="button" className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-stone-200" onClick={() => setDetailsBook(activeBook)}>
                  Open details
                </button>
                <button type="button" className="rounded-lg border border-orange-300/30 bg-orange-500/90 px-3 py-2 text-xs font-semibold text-white" onClick={() => openEdit(activeBook)}>
                  Edit
                </button>
                <button type="button" className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-stone-200" onClick={() => setActiveBook(null)}>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>

      <BookDetailsModal
        book={detailsBook}
        open={!!detailsBook}
        onClose={() => setDetailsBook(null)}
        onEdit={openEdit}
      />

      <BookFormModal
        open={addModalOpen || !!editingBook}
        onClose={() => {
          setAddModalOpen(false)
          setEditingBook(null)
        }}
        onSave={saveBook}
        book={editingBook}
      />

      <AnimatePresence>
        {bookToDelete && (
          <motion.aside
            className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBookToDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="mx-auto mt-36 w-full max-w-md rounded-2xl border border-white/10 bg-black/90 p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white">Remove book from catalog?</h3>
              <p className="mt-2 text-sm text-stone-300">
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
                    const id = bookToDelete._id
                    try {
                      await removeBook(id)
                      setDetailsBook((b) => (b?._id === id ? null : b))
                      setEditingBook((b) => (b?._id === id ? null : b))
                      setActiveBook((b) => (b?._id === id ? null : b))
                      setBookToDelete(null)
                    } catch (e) {
                      alert(e.message || 'Failed to delete')
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
    </AdminLayout>
  )
}

