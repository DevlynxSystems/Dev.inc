import { useState, useRef } from 'react'
import './BookFormModal.css'

export function BookFormModal({ open, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [pageNumber, setPageNumber] = useState('')
  const [error, setError] = useState('')
  const [coverBase64, setCoverBase64] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const fileInputRef = useRef(null)

  const reset = () => {
    setTitle('')
    setAuthor('')
    setPublishDate('')
    setPageNumber('')
    setCoverBase64(null)
    setCoverPreview(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (e.g. JPEG, PNG, GIF, WebP, SVG, BMP).')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Image must be under 20MB.')
      return
    }
    setError('')

    const reader = new FileReader()
    reader.onload = () => {
      setCoverBase64(reader.result)
      setCoverPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      title: title.trim(),
      author: author.trim(),
      pageCount: parseInt(pageNumber, 10) || 0,
      cover: coverBase64 || null,
      date: publishDate ? new Date(publishDate) : new Date()
    })
    reset()
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
            Add new book
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
              >
                {coverPreview ? 'Change Image' : 'Upload Image'}
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
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  title="Any image type (JPEG, PNG, GIF, WebP, SVG, BMP, etc.)"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Book
              </button>
            </div>
          </form>
        </div>
      </aside>
  )
}