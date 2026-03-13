import './Footer.css'

const SITE_PUBLISHED = '2025'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/logo.png" alt="" className="footer-logo" aria-hidden="true" />
          <span className="footer-title">Book Catalog</span>
        </div>
        <div className="footer-links">
          <a href="#" className="footer-link">About</a>
          <a href="#" className="footer-link">Contact</a>
          <a href="#" className="footer-link">Privacy</a>
        </div>
        <div className="footer-copy-wrap">
          <p className="footer-copy">
            © {currentYear} Dev.inc. All rights reserved.
          </p>
          <p className="footer-published">
            Published {SITE_PUBLISHED}
          </p>
        </div>
      </div>
    </footer>
  )
}
