import { Link } from 'react-router-dom'

const SITE_PUBLISHED = '2025'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative mt-16 px-2 sm:px-3 md:px-4" role="contentinfo">
      <div className="mx-auto h-px w-full max-w-[78rem] bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
      <div className="mx-auto mt-6 w-full max-w-[78rem] rounded-3xl border border-white/10 bg-black/35 px-4 py-8 shadow-[0_16px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-6 md:px-8">
        <div className="grid gap-8 md:grid-cols-[1.3fr_2fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="" className="h-8 w-8 object-contain" aria-hidden="true" />
              <span className="text-xl font-semibold tracking-tight text-stone-100">Book Catalog</span>
            </div>
            <p className="max-w-sm text-sm leading-6 text-stone-400">Curate, discover, and organize your reading world in one premium catalog experience.</p>
          </div>
          <nav className="grid gap-6 sm:grid-cols-3" aria-label="Footer navigation">
            <div className="space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Product</span>
              <Link to="/catalog" className="block text-sm text-stone-300 transition hover:text-orange-300">All books</Link>
              <Link to="/admin" className="block text-sm text-stone-300 transition hover:text-orange-300">Manage catalog</Link>
              <Link to="/catalog" className="block text-sm text-stone-300 transition hover:text-orange-300">Collections</Link>
            </div>
            <div className="space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Company</span>
              <a href="#" className="block text-sm text-stone-300 transition hover:text-orange-300">About</a>
              <a href="#" className="block text-sm text-stone-300 transition hover:text-orange-300">Contact</a>
            </div>
            <div className="space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Legal</span>
              <a href="#" className="block text-sm text-stone-300 transition hover:text-orange-300">Privacy</a>
              <a href="#" className="block text-sm text-stone-300 transition hover:text-orange-300">Terms</a>
            </div>
          </nav>
        </div>
        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs text-stone-400">© {currentYear} Dev.inc. All rights reserved.</p>
            <p className="text-xs text-stone-500">Published {SITE_PUBLISHED}</p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-stone-300 transition hover:border-orange-400/40 hover:bg-orange-500/10 hover:text-orange-200"
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
