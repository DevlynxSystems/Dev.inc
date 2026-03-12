import { useState } from 'react'
import './BookFormModal.css'

export function BookFormModal({ open, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [pages, setPages] = useState('') // Renamed from year to match schema
  const [coverUrl, setCoverUrl] = useState('')

  const reset = () => {
    setTitle('')
    setAuthor('')
    setPages('')
    setCoverUrl('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // This object now matches your Mongoose Schema keys
    onSave({
      title: title.trim(),
      author: author.trim(),
      pageCount: parseInt(pages, 10) || 0, // Maps to pageCount: { type: Number, required: true }
      cover: coverUrl.trim() || null,      // Maps to cover: { type: String/Buffer }
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

          <label htmlFor="coverUrl">Cover Image URL</label>
          <input
            type="url"
            id="coverUrl"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />

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