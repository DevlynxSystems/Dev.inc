import './Hero.css'

export function Hero({ onAddBook }) {
  const scrollToCatalog = () => {
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero" aria-label="Welcome">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <path d="M8 7h8" />
            <path d="M8 11h8" />
          </svg>
        </div>
        <p className="hero-label">Your library</p>
        <h1 className="hero-title">Book Catalog</h1>
        <p className="hero-tagline">
          Curate, discover, and manage your library. Add your favorites, edit details, and keep everything in one place.
        </p>
        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-primary hero-cta"
            onClick={onAddBook}
          >
            Add a book
          </button>
          <button
            type="button"
            className="btn btn-secondary hero-secondary"
            onClick={scrollToCatalog}
          >
            Browse catalog
          </button>
        </div>
      </div>
    </section>
  )
}
