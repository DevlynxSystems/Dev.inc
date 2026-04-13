/**
 * ExpandableTabs Component
 *
 * Responsive tab system that supports both desktop tabs and mobile accordion view.
 *
 * Features:
 * - Accessible tab navigation (ARIA roles and keyboard-friendly structure)
 * - Desktop tab interface with single active panel
 * - Mobile accordion fallback using <details>
 * - Maintains active state across both layouts
 * - Safe handling of empty or invalid items
 *
 * Props:
 * @param {Array<{title: string, content: React.ReactNode}>} items - Tab items to display
 * @param {number} [defaultIndex=0] - Initial active tab index
 * @param {string} [ariaLabel='Expandable tabs'] - Accessibility label for the tab group
 *
 * State:
 * - activeIndex: Tracks currently selected tab/accordion section
 *
 */


import { useId, useMemo, useState } from 'react'
import './ExpandableTabs.css'

export function ExpandableTabs({ items, defaultIndex = 0, ariaLabel = 'Expandable tabs' }) {
  const baseId = useId()
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : []

  const initial = useMemo(() => {
    if (safeItems.length === 0) return 0
    const idx = Number(defaultIndex)
    if (Number.isFinite(idx) && idx >= 0 && idx < safeItems.length) return idx
    return 0
  }, [defaultIndex, safeItems.length])

  const [activeIndex, setActiveIndex] = useState(initial)

  if (safeItems.length === 0) return null

  return (
    <section className="exp-tabs" aria-label={ariaLabel}>
      <div className="exp-tabs-bar" role="tablist" aria-label={ariaLabel}>
        {safeItems.map((it, idx) => {
          const tabId = `${baseId}-tab-${idx}`
          const panelId = `${baseId}-panel-${idx}`
          const selected = idx === activeIndex
          return (
            <button
              key={tabId}
              id={tabId}
              type="button"
              className={`exp-tab ${selected ? 'is-active' : ''}`}
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveIndex(idx)}
            >
              {it.title}
            </button>
          )
        })}
      </div>

      {/* Desktop / larger screens: single panel */}
      <div className="exp-panels">
        {safeItems.map((it, idx) => {
          const tabId = `${baseId}-tab-${idx}`
          const panelId = `${baseId}-panel-${idx}`
          const selected = idx === activeIndex
          return (
            <div
              key={panelId}
              id={panelId}
              className={`exp-panel ${selected ? 'is-active' : ''}`}
              role="tabpanel"
              aria-labelledby={tabId}
              hidden={!selected}
            >
              {it.content}
            </div>
          )
        })}
      </div>

      {/* Mobile: accordion */}
      <div className="exp-accordion" aria-label={`${ariaLabel} accordion`}>
        {safeItems.map((it, idx) => {
          const panelId = `${baseId}-acc-panel-${idx}`
          const open = idx === activeIndex
          return (
            <details
              key={panelId}
              className="exp-acc-item"
              open={open}
              onToggle={(e) => {
                if (e.currentTarget.open) setActiveIndex(idx)
              }}
            >
              <summary className="exp-acc-summary">
                <span className="exp-acc-title">{it.title}</span>
                <span className="exp-acc-chevron" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <div className="exp-acc-body">{it.content}</div>
            </details>
          )
        })}
      </div>
    </section>
  )
}

