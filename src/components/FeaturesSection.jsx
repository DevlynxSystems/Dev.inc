import './FeaturesSection.css'

const FEATURES = [
  {
    title: 'Curate your collection',
    description: 'Add books with covers, titles, authors, and details. Build a personal library that reflects what you love.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    title: 'Discover & organize',
    description: 'Search, filter by date, and sort your catalog. Find any book quickly and keep everything in order.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
        <path d="M11 8v6" />
        <path d="M8 11h6" />
      </svg>
    ),
  },
  {
    title: 'Manage in one place',
    description: 'Edit details, update covers, and remove entries. Your library stays up to date with minimal effort.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
]

export function FeaturesSection() {
  return (
    <section className="features-section" aria-labelledby="features-heading">
      <h2 id="features-heading" className="features-heading">Why use Book Catalog</h2>
      <p className="features-subtitle">Everything you need to keep your reading life in order.</p>
      <div className="features-grid" role="list">
        {FEATURES.map((feature, index) => (
          <article key={index} className="feature-card" role="listitem">
            <div className="feature-icon" aria-hidden="true">
              {feature.icon}
            </div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-desc">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
