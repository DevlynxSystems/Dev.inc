import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { BookOpenText, CalendarDays, FileText, ImagePlus, PenLine, Tags, UserRound } from 'lucide-react'
import { useEscapeKey, usePrefersReducedMotion } from '../lib/a11yHooks'

const FORM_ERROR_ID = 'book-form-error'

const MAX_COVER_PIXELS = 800
const COVER_JPEG_QUALITY = 0.82
const MAX_COVER_BASE64_BYTES = 500 * 1024

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml,image/bmp,image/x-icon,image/*'

function isImageFile(file) {
  if (file.type && file.type.startsWith('image/')) return true
  const name = (file.name || '').toLowerCase()
  return /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/.test(name)
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Could not read image'))
      reader.readAsDataURL(file)
      return
    }
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const w = img.naturalWidth || img.width
      const h = img.naturalHeight || img.height
      let width = w
      let height = h
      if (w > MAX_COVER_PIXELS || h > MAX_COVER_PIXELS) {
        if (w >= h) {
          width = MAX_COVER_PIXELS
          height = Math.round((h * MAX_COVER_PIXELS) / w)
        } else {
          height = MAX_COVER_PIXELS
          width = Math.round((w * MAX_COVER_PIXELS) / h)
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', COVER_JPEG_QUALITY)
      const base64Length = (dataUrl.length * 3) / 4
      if (base64Length > MAX_COVER_BASE64_BYTES) {
        const scale = Math.sqrt(MAX_COVER_BASE64_BYTES / base64Length)
        canvas.width = Math.max(1, Math.round(width * scale))
        canvas.height = Math.max(1, Math.round(height * scale))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      } else {
        resolve(dataUrl)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Invalid image'))
    }
    img.src = url
  })
}

export function BookFormModal({ open, onClose, onSave, book: editingBook }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [pageNumber, setPageNumber] = useState('')
  const [error, setError] = useState('')
  const [coverBase64, setCoverBase64] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const firstFieldId = 'book-form-title'
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!open) {
      reset()
      return
    }
    if (editingBook) {
      setTitle(editingBook.title || '')
      setAuthor(editingBook.author || '')
      setGenre(editingBook.genre != null ? String(editingBook.genre) : '')
      setPublishDate(editingBook.date ? new Date(editingBook.date).toISOString().slice(0, 10) : '')
      setPageNumber(editingBook.pageCount != null ? String(editingBook.pageCount) : '')
      setCoverBase64(editingBook.cover || null)
      setCoverPreview(editingBook.cover || null)
      setError('')
    } else {
      reset()
    }
  }, [open, editingBook])

  useEffect(() => {
    if (!open) return
    const t = requestAnimationFrame(() => {
      document.getElementById(firstFieldId)?.focus()
    })
    return () => cancelAnimationFrame(t)
  }, [open, editingBook?._id])

  const reset = () => {
    setTitle('')
    setAuthor('')
    setGenre('')
    setPublishDate('')
    setPageNumber('')
    setCoverBase64(null)
    setCoverPreview(null)
    setError('')
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    await processFile(file)
  }

  const processFile = async (file) => {
    if (!isImageFile(file)) {
      setError('Please select an image file (PNG, JPEG, JPG, GIF, WebP, SVG, BMP, etc.).')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Image must be under 20MB.')
      return
    }
    setError('')
    setUploading(true)
    try {
      const dataUrl = await compressImage(file)
      setCoverBase64(dataUrl)
      setCoverPreview(dataUrl)
    } catch (err) {
      setError(err.message || 'Could not process image')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (!file) return
    await processFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = {
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      pageCount: parseInt(pageNumber, 10) || 0,
      cover: coverBase64 !== null ? coverBase64 : (editingBook?.cover ?? null),
      date: publishDate ? new Date(publishDate) : (editingBook?.date ? new Date(editingBook.date) : new Date())
    }
    try {
      await onSave(payload, editingBook?._id)
      reset()
    } catch (err) {
      setError(err.message || (editingBook ? 'Failed to update book' : 'Failed to add book'))
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  useEscapeKey(open, handleClose)

  if (!open) return null

  const motionDur = reducedMotion ? 0 : 0.2

  return (
    <aside
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      aria-hidden="false"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <motion.div
        className="absolute inset-0 bg-black/65 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: motionDur }}
      />
      <motion.div
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: motionDur }}
        className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-black/50 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(249,115,22,0.22),transparent_42%),radial-gradient(circle_at_90%_10%,rgba(59,130,246,0.2),transparent_35%)]" />
        <form className="relative grid gap-6 p-5 md:grid-cols-[1fr_1.3fr] md:p-7" onSubmit={handleSubmit}>
          <section className="space-y-4">
            <div>
              <h2 id="modal-title" className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <p id="modal-description" className="mt-1 text-sm text-stone-300">
                Add a new book to your catalog with complete metadata and a premium cover preview.
              </p>
            </div>

            <div
              className={`group relative overflow-hidden rounded-2xl border transition ${
                isDragging ? 'border-orange-300/55 bg-orange-500/10' : 'border-white/15 bg-white/[0.04]'
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="aspect-[2/3] w-full">
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-900 to-stone-800">
                    <BookOpenText className="h-14 w-14 text-stone-500" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 border-t border-white/15 bg-black/50 px-3 py-2 text-sm font-medium text-stone-100 opacity-95 transition group-hover:bg-black/65"
                disabled={uploading}
                aria-label={coverPreview ? 'Upload or change cover image' : 'Upload cover image'}
              >
                <ImagePlus className="h-4 w-4" />
                {uploading ? 'Processing...' : coverPreview ? 'Upload / Change image' : 'Upload cover image'}
              </button>
            </div>

            {coverPreview && (
              <button
                type="button"
                className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
                onClick={() => {
                  setCoverBase64(null)
                  setCoverPreview(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
              >
                Remove image
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={IMAGE_ACCEPT}
              onChange={handleFileChange}
              className="hidden"
              aria-label="Choose cover image file. PNG, JPEG, WebP, and other common image types."
            />
          </section>

          <section className="space-y-4">
            {error && (
              <p
                id={FORM_ERROR_ID}
                role="alert"
                aria-live="polite"
                aria-atomic="true"
                className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
              >
                {error}
              </p>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.12em] text-stone-400">Basic information</p>
              <div className="space-y-3">
                <FloatingField
                  id={firstFieldId}
                  label="Book title"
                  icon={PenLine}
                  value={title}
                  onChange={setTitle}
                  required
                  ariaInvalid={!!error}
                  ariaDescribedBy={error ? FORM_ERROR_ID : undefined}
                />
                <FloatingField
                  id="book-form-author"
                  label="Author"
                  icon={UserRound}
                  value={author}
                  onChange={setAuthor}
                  required
                  ariaInvalid={!!error}
                  ariaDescribedBy={error ? FORM_ERROR_ID : undefined}
                />
                <FloatingField
                  id="book-form-genre"
                  label="Genre (optional)"
                  icon={Tags}
                  value={genre}
                  onChange={setGenre}
                  ariaInvalid={!!error}
                  ariaDescribedBy={error ? FORM_ERROR_ID : undefined}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.12em] text-stone-400">Metadata</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <FloatingField
                  id="book-form-date"
                  label="Publish date"
                  icon={CalendarDays}
                  value={publishDate}
                  onChange={setPublishDate}
                  type="date"
                  ariaInvalid={!!error}
                  ariaDescribedBy={error ? FORM_ERROR_ID : undefined}
                />
                <FloatingField
                  id="book-form-pages"
                  label="Pages"
                  icon={FileText}
                  value={pageNumber}
                  onChange={setPageNumber}
                  type="number"
                  min="1"
                  required
                  ariaInvalid={!!error}
                  ariaDescribedBy={error ? FORM_ERROR_ID : undefined}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                type="button"
                className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-stone-100 transition hover:scale-[1.02] hover:border-white/25 hover:bg-white/[0.08]"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl border border-orange-300/35 bg-orange-500/90 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(249,115,22,0.35)] transition hover:scale-[1.02] hover:bg-orange-400"
              >
                {editingBook ? 'Save changes' : 'Save Book'}
              </button>
            </div>
          </section>
        </form>
      </motion.div>
    </aside>
  )
}

function FloatingField({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  type = 'text',
  required = false,
  autoFocus = false,
  min,
  ariaInvalid = false,
  ariaDescribedBy,
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoFocus={autoFocus}
        min={min}
        placeholder=" "
        aria-invalid={ariaInvalid || undefined}
        aria-describedby={ariaDescribedBy || undefined}
        className="peer h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-3 pt-4 text-sm text-stone-100 outline-none transition placeholder:text-transparent hover:border-white/20 focus:border-orange-300/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(249,115,22,0.18)] aria-invalid:border-rose-400/50"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-10 top-3.5 origin-left text-sm text-stone-400 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-orange-200 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[11px]"
      >
        {label}
      </label>
    </div>
  )
}