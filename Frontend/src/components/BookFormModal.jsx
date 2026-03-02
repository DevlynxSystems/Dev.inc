import { useState } from 'react'
import './BookFormModal.css'

export function BookFormModal({ open, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [year, setYear] = useState('')
  const [genre, setGenre] = useState('')

  const reset = () => {
    setTitle('')
    setAuthor('')
    setYear('')
    setGenre('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      title: title.trim(),
      author: author.trim(),
      year: year ? parseInt(year, 10) : null,
      genre: genre.trim() || null,
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
          Add book
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
          <label htmlFor="year">Year</label>
          <input
            type="number"
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min="1000"
            max="2100"
            placeholder="e.g. 2020"
          />
          <label htmlFor="genre">Genre</label>
          <input
            type="text"
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="e.g. Fiction"
          />
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </aside>
  )
}
