import './BookDetailsModal.css'

function formatPages(n) {
  if (n == null) return null
  return Number(n).toLocaleString() + (n === 1 ? ' page' : ' pages')
}

export function BookDetailsModal({ book, open, onClose, onEdit }) {
  if (!open || !book) return null

  const title = book.title ?? 'Untitled'
  const author = book.author ?? 'Unknown author'
  const publishDate = book.date
    ? new Date(book.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

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
        <div className="details-layout">
          {book.cover && (
            <div className="details-cover-wrap">
              <img
                src={book.cover}
                alt={`Cover of ${title}`}
                className="details-cover-img"
              />
            </div>
          )}
          <div className="details-content">
            <h2 id="details-title" className="details-title">
              {title}
            </h2>
            {author && (
              <p className="details-author">{author}</p>
            )}
            {book.genre && (
              <span className="details-genre-badge">{book.genre}</span>
            )}
            <dl className="details-list">
              {book.date && (
                <div className="details-row">
                  <dt>Publish date</dt>
                  <dd>{publishDate}</dd>
                </div>
              )}
              {book.pageCount != null && (
                <div className="details-row">
                  <dt>Pages</dt>
                  <dd>{formatPages(book.pageCount)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
        <div className="details-actions">
          {onEdit && (
            <button type="button" className="btn btn-secondary" onClick={() => { onEdit(book); onClose() }}>
              Edit
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </aside>
  )
}