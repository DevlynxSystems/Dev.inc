import { BookCard } from './BookCard'
import './SuggestionsSection.css'

const TRENDING_LIMIT = 6
const CLASSIC_YEAR_CUTOFF = 1980
const CLASSIC_LIMIT = 6

export function SuggestionsSection({ books, onView, onEdit, onRemove }) {
  const trendingBooks = books.slice(0, TRENDING_LIMIT)
  const classicBooks = books
    .filter((b) => {
      if (!b.date) return false
      const year = new Date(b.date).getFullYear()
      return year < CLASSIC_YEAR_CUTOFF
    })
    .slice(0, CLASSIC_LIMIT)

  if (books.length === 0) return null

  return (
    <section className="suggestions" aria-label="Book suggestions">
      {(trendingBooks.length > 0 || classicBooks.length > 0) && (
        <div className="suggestions-inner">
          {trendingBooks.length > 0 && (
            <div className="suggestion-block">
              <h2 className="suggestion-heading">Trending</h2>
              <p className="suggestion-subtitle">Recently added & popular</p>
              <div className="suggestion-row" role="list">
                {trendingBooks.map((book) => (
                  <div key={book._id} className="suggestion-card-wrap" role="listitem">
                    <BookCard
                      book={book}
                      onView={onView}
                      onEdit={onEdit}
                      onRemove={onRemove}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {classicBooks.length > 0 && (
            <div className="suggestion-block">
              <h2 className="suggestion-heading">Classic reads</h2>
              <p className="suggestion-subtitle">Timeless picks (pre-{CLASSIC_YEAR_CUTOFF})</p>
              <div className="suggestion-row" role="list">
                {classicBooks.map((book) => (
                  <div key={book._id} className="suggestion-card-wrap" role="listitem">
                    <BookCard
                      book={book}
                      onView={onView}
                      onEdit={onEdit}
                      onRemove={onRemove}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {trendingBooks.length === 0 && classicBooks.length === 0 && (
            <p className="suggestion-empty">Add books with publish dates to see suggestions.</p>
          )}
        </div>
      )}
    </section>
  )
}
