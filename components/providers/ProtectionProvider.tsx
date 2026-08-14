'use client'

import { useEffect } from 'react'

/**
 * Disables right-click, F12, Ctrl+Shift+I, Ctrl+U on public pages.
 * Client-side only — deter casual screenshot, not determined users.
 */
export function ProtectionProvider() {
  useEffect(() => {
    // Skip on admin pages
    if (window.location.pathname.startsWith('/admin')) return

    const disable = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') { e.preventDefault(); return }
      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) { e.preventDefault(); return }
      // Ctrl+U (view source)
      if (e.ctrlKey && e.key.toUpperCase() === 'U') { e.preventDefault(); return }
    }

    const ctxmenu = (e: Event) => e.preventDefault()

    window.addEventListener('keydown', disable)
    document.addEventListener('contextmenu', ctxmenu)
    document.body.classList.add('no-drag')

    return () => {
      window.removeEventListener('keydown', disable)
      document.removeEventListener('contextmenu', ctxmenu)
      document.body.classList.remove('no-drag')
    }
  }, [])

  return null
}
