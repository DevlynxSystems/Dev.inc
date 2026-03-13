import './Footer.css'

const SITE_PUBLISHED = '2025'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand-block">
            <div className="footer-brand">
              <img src="/logo.png" alt="" className="footer-logo" aria-hidden="true" />
              <span className="footer-title">Book Catalog</span>
            </div>
            <p className="footer-tagline">Curate, discover, and manage your library.</p>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            <div className="footer-col">
              <span className="footer-col-title">Product</span>
              <a href="#catalog" className="footer-link">All books</a>
              <a href="#" className="footer-link">Add book</a>
              <a href="#" className="footer-link">Suggestions</a>
            </div>
            <div className="footer-col">
              <span className="footer-col-title">Company</span>
              <a href="#" className="footer-link">About</a>
              <a href="#" className="footer-link">Contact</a>
            </div>
            <div className="footer-col">
              <span className="footer-col-title">Legal</span>
              <a href="#" className="footer-link">Privacy</a>
              <a href="#" className="footer-link">Terms</a>
            </div>
          </nav>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy-wrap">
            <p className="footer-copy">© {currentYear} Dev.inc. All rights reserved.</p>
            <p className="footer-published">Published {SITE_PUBLISHED}</p>
          </div>
          <button
            type="button"
            className="footer-back-top"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  )
}
