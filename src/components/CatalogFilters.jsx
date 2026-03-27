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
