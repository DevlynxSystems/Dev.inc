import { useState, useRef } from 'react'
import './BookFormModal.css'

export function BookFormModal({ open, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [pages, setPages] = useState('')
  const [coverBase64, setCoverBase64] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const fileInputRef = useRef(null)

  const reset = () => {
    setTitle('')
    setAuthor('')
    setPages('')
    setCoverBase64(null)
    setCoverPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setCoverBase64(reader.result)   // full data URL (base64)
      setCoverPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      title: title.trim(),
      author: author.trim(),
      pageCount: parseInt(pages, 10) || 0,
      cover: coverBase64 || null,
      date: new Date()
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

            <label htmlFor="pages">Page Count</label>
            <input
                type="number"
                id="pages"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
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