import { useState, useEffect } from 'react'

function supportsMatchMedia() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
}

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (!supportsMatchMedia()) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (!supportsMatchMedia()) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (event) => setReducedMotion(event.matches)

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return reducedMotion
}
