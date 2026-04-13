import './CatalogFilters.css'

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title-az', label: 'Title A–Z' },
  { value: 'title-za', label: 'Title Z–A' },
  { value: 'pages-desc', label: 'Most pages' },
  { value: 'pages-asc', label: 'Fewest pages' },
]

export const DATE_FILTER_OPTIONS = [
  { value: 'all', label: 'All books' },
  { value: 'classic', label: 'Classic (pre-1980)' },
  { value: 'recent', label: 'Recent (2000+)' },
]

const CLASSIC_YEAR = 1980
const RECENT_YEAR = 2000

export function filterByDateFilter(books, dateFilter) {
  if (dateFilter === 'all') return books
  return books.filter((b) => {
    if (!b.date) return dateFilter === 'all'
    const year = new Date(b.date).getFullYear()
    if (dateFilter === 'classic') return year < CLASSIC_YEAR
    if (dateFilter === 'recent') return year >= RECENT_YEAR
    return true
  })
}

/** Sentinel: show books with no genre set (empty string). */
export const GENRE_FILTER_UNCATEGORIZED = '__none__'

/** Preferred order for genre pills / dropdowns; unknown labels sort after these. */
export const GENRE_DISPLAY_ORDER = [
  'Fiction',
  'Literary',
  'Classic',
  'Sci-Fi',
  'Fantasy',
  'Dystopian',
  'Mystery',
  'Thriller',
  'Horror',
  'Romance',
  'Historical',
  'Historical Fiction',
  'Adventure',
  'Magical Realism',
  'Gothic',
  'Memoir',
  'Nonfiction',
]

/**
 * Unique genres from `books`, sorted for filters (common order first, then A–Z).
 * @param {Array<{ genre?: string }>} books
 * @returns {{ genres: string[], hasUncategorized: boolean }}
 */
export function buildGenreFilterList(books) {
  const seen = new Set()
  let uncategorized = 0
  for (const b of books) {
    const g = (b.genre && String(b.genre).trim()) || ''
    if (!g) uncategorized += 1
    else seen.add(g)
  }
  const genres = Array.from(seen).sort((a, b) => {
    const ia = GENRE_DISPLAY_ORDER.indexOf(a)
    const ib = GENRE_DISPLAY_ORDER.indexOf(b)
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    return a.localeCompare(b, undefined, { sensitivity: 'base' })
  })
  return { genres, hasUncategorized: uncategorized > 0 }
}

/**
 * @param {string} genreFilter `'all'` | `GENRE_FILTER_UNCATEGORIZED` | exact genre label from data
 */
export function filterByGenre(books, genreFilter) {
  if (!genreFilter || genreFilter === 'all') return books
  if (genreFilter === GENRE_FILTER_UNCATEGORIZED) {
    return books.filter((b) => !((b.genre && String(b.genre).trim()) || ''))
  }
  const want = String(genreFilter).trim().toLowerCase()
  return books.filter((b) => (b.genre || '').trim().toLowerCase() === want)
}

export function sortBooks(books, sortBy) {
  const list = [...books]
  switch (sortBy) {
    case 'newest':
      list.sort((a, b) => (new Date(b.date || 0) - new Date(a.date || 0)))
      break
    case 'oldest':
      list.sort((a, b) => (new Date(a.date || 0) - new Date(b.date || 0)))
      break
    case 'title-az':
      list.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' }))
      break
    case 'title-za':
      list.sort((a, b) => (b.title ?? '').localeCompare(a.title ?? '', undefined, { sensitivity: 'base' }))
      break
    case 'pages-desc':
      list.sort((a, b) => (b.pageCount ?? 0) - (a.pageCount ?? 0))
      break
    case 'pages-asc':
      list.sort((a, b) => (a.pageCount ?? 0) - (b.pageCount ?? 0))
      break
    default:
      break
  }
  return list
}

export function CatalogFilters({ sortBy, dateFilter, onSortChange, onDateFilterChange }) {
  return (
    <div className="catalog-filters" role="group" aria-label="Filter and sort catalog">
      <div className="catalog-filter-group">
        <label htmlFor="catalog-date-filter" className="catalog-filter-label">Show</label>
        <select
          id="catalog-date-filter"
          className="catalog-filter-select"
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
          aria-label="Filter by date"
        >
          {DATE_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="catalog-filter-group">
        <label htmlFor="catalog-sort" className="catalog-filter-label">Sort by</label>
        <select
          id="catalog-sort"
          className="catalog-filter-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort order"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
