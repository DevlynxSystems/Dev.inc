import './BookDetailsModal.css'

export function BookDetailsModal({ book, open, onClose }) {
  if (!open || !book) return null

  return (
    <aside
      className="modal details-modal"
      aria-hidden="false"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-backdrop" aria-hidden="true" />
      <div
        className="modal-panel details-panel"
        role="dialog"
        aria-labelledby="details-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="details-title" className="details-title">
          Book details
        </h2>
        <dl className="details-list">
          <div className="details-row">
            <dt>Title</dt>
            <dd>{book.title}</dd>
          </div>
          <div className="details-row">
            <dt>Author</dt>
            <dd>{book.author}</dd>
          </div>
          {book.year != null && (
            <div className="details-row">
              <dt>Year</dt>
              <dd>{book.year}</dd>
            </div>
          )}
          {book.genre && (
            <div className="details-row">
              <dt>Genre</dt>
              <dd>{book.genre}</dd>
            </div>
          )}
        </dl>
        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </aside>
  )
}
