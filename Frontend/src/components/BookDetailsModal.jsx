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
          {book.cover && (
              <div className="details-cover-wrap">
                <img
                    src={book.cover}
                    alt={`Cover of ${book.title}`}
                    className="details-cover-img"
                />
              </div>
          )}
          <dl className="details-list">
            <div className="details-row">
              <dt>Title</dt>
              <dd>{book.title}</dd>
            </div>
            <div className="details-row">
              <dt>Author</dt>
              <dd>{book.author}</dd>
            </div>
            {book.date && (
                <div className="details-row">
                  <dt>Publish Date</dt>
                  <dd>{new Date(book.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
                </div>
            )}
            {book.pageCount != null && (
                <div className="details-row">
                  <dt>Page Number</dt>
                  <dd>{book.pageCount}</dd>
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