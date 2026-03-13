import { useState } from 'react'
import './BookCard.css'

export function BookCard({ book, onView, onRemove }) {
    const [coverError, setCoverError] = useState(false)
    const showImg = book.cover && !coverError

    return (
        <article className="book-card" data-book-id={book.id}>
            <div className="book-card-cover" aria-hidden="true">
                {showImg ? (
                    <img
                        src={book.cover}
                        alt={`Cover: ${book.title}`}
                        className="book-card-cover-img"
                        loading="eager"
                        onError={() => setCoverError(true)}
                    />
                ) : (
                    <span className="book-card-cover-inner">{book.title.charAt(0)}</span>
                )}
            </div>
            <div className="book-card-body">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.author}</p>
                <div className="book-meta">
                    {book.date && (
                      <span className="book-year">
                        {new Date(book.date).getFullYear()}
                      </span>
                    )}
                    {book.pageCount != null && (
                      <span className="book-pages">{book.pageCount} pp.</span>
                    )}
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