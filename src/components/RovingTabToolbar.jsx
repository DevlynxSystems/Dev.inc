import { useCallback, useEffect, useRef } from 'react'

/**
 * Toolbar of buttons with roving tabindex (Arrow/Home/End; focus follows).
 */
export function RovingTabToolbar({ ariaLabel, children, className = '' }) {
  const containerRef = useRef(null)

  const syncTabIndices = useCallback((focusedBtn) => {
    const root = containerRef.current
    if (!root) return
    const buttons = [...root.querySelectorAll('button')].filter((b) => !b.disabled)
    if (buttons.length === 0) return
    const focusEl = focusedBtn && buttons.includes(focusedBtn) ? focusedBtn : buttons[0]
    buttons.forEach((b) => {
      b.tabIndex = b === focusEl ? 0 : -1
    })
  }, [])

  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    syncTabIndices(null)
  }, [children, syncTabIndices])

  const onFocusIn = useCallback(
    (e) => {
      const t = e.target
      if (t?.tagName !== 'BUTTON') return
      syncTabIndices(t)
    },
    [syncTabIndices]
  )

  const onKeyDown = useCallback(
    (e) => {
      const root = containerRef.current
      if (!root) return
      const buttons = [...root.querySelectorAll('button')].filter((b) => !b.disabled)
      if (buttons.length === 0) return
      const active = document.activeElement
      let idx = buttons.indexOf(active)
      if (idx < 0) return

      let next = idx
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        next = Math.min(buttons.length - 1, idx + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        next = Math.max(0, idx - 1)
      } else if (e.key === 'Home') {
        e.preventDefault()
        next = 0
      } else if (e.key === 'End') {
        e.preventDefault()
        next = buttons.length - 1
      } else {
        return
      }
      buttons[next]?.focus()
      syncTabIndices(buttons[next])
    },
    [syncTabIndices]
  )

  return (
    <div
      ref={containerRef}
      role="toolbar"
      aria-label={ariaLabel}
      className={className}
      onFocusCapture={onFocusIn}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  )
}
