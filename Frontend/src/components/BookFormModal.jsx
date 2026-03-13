import { useState, useRef, useEffect } from 'react'
import './BookFormModal.css'

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
  const [publishDate, setPublishDate] = useState('')
  const [pageNumber, setPageNumber] = useState('')
  const [error, setError] = useState('')
  const [coverBase64, setCoverBase64] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!open) {
      reset()
      return
    }
    if (editingBook) {
      setTitle(editingBook.title || '')
      setAuthor(editingBook.author || '')
      setPublishDate(editingBook.date ? new Date(editingBook.date).toISOString().slice(0, 10) : '')
      setPageNumber(editingBook.pageCount != null ? String(editingBook.pageCount) : '')
      setCoverBase64(editingBook.cover || null)
      setCoverPreview(editingBook.cover || null)
      setError('')
    } else {
      reset()
    }
  }, [open, editingBook])

  const reset = () => {
    setTitle('')
    setAuthor('')
    setPublishDate('')
    setPageNumber('')
    setCoverBase64(null)
    setCoverPreview(null)
    setError('')
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = {
      title: title.trim(),
      author: author.trim(),
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

  if (!open) return null

  return (
      <aside
          className="modal"
          aria-hidden="false"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <div className="modal-backdrop" aria-hidden="true" />
        <div
            className="modal-panel"
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
        >
          <h2 id="modal-title" className="modal-title">
            {editingBook ? 'Edit book' : 'Add new book'}
          </h2>
          <form className="book-form" onSubmit={handleSubmit}>
            {error && <p className="form-error">{error}</p>}
            <label htmlFor="title">Title</label>
            <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
            />

            <label htmlFor="author">Author</label>
            <input
                type="text"
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
            />

            <label htmlFor="publishDate">Publish Date</label>
            <input
                type="date"
                id="publishDate"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
            />

            <label htmlFor="pageNumber">Page Number</label>
            <input
                type="number"
                id="pageNumber"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                required
                min="1"
                placeholder="e.g. 350"
            />

            <label>Cover Image</label>
            <div className="cover-upload-wrap">
              {coverPreview && (
                  <img src={coverPreview} alt="Cover preview" className="cover-preview" />
              )}
              <button
                  type="button"
                  className="btn btn-secondary cover-upload-btn"
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
              >
                {uploading ? 'Processing…' : coverPreview ? 'Change Image' : 'Upload Image'}
              </button>
              {coverPreview && (
                  <button
                      type="button"
                      className="btn btn-danger cover-remove-btn"
                      onClick={() => { setCoverBase64(null); setCoverPreview(null); fileInputRef.current.value = '' }}
                  >
                    Remove
                  </button>
              )}
              <input
                  ref={fileInputRef}
                  type="file"
                  accept={IMAGE_ACCEPT}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  title="PNG, JPEG, JPG, GIF, WebP, SVG, BMP, and other image types"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingBook ? 'Save changes' : 'Save Book'}
              </button>
            </div>
          </form>
        </div>
      </aside>
  )
}