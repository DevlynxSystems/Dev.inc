import './BookCard.css'

export function BookCard({ book, onView, onRemove }) {
  return (
    <article className="book-card" data-book-id={book.id}>
      <div className="book-card-body">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <div className="book-meta">
          {book.year && <span className="book-year">{book.year}</span>}
          {book.genre && <span className="book-genre">{book.genre}</span>}
        </div>
      </div>
      <div className="book-card-actions">
        <button
          type="button"
          className="btn btn-secondary book-view"
          onClick={() => onView(book)}
          aria-label={`View details for ${book.title}`}
        >
          View details
        </button>
        <button
          type="button"
          className="btn btn-danger book-remove"
          onClick={onRemove}
          aria-label={`Remove ${book.title}`}
        >
          Delete
        </button>
      </div>
    </article>
  )
}
