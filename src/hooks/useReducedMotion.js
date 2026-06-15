import { useState, useEffect } from 'react'

/**
 * Hook que detecta si el usuario prefiere reducir animaciones.
 * Respeta la preferencia del sistema operativo (prefers-reduced-motion).
 * @returns {boolean} True si el usuario prefiere reducir animaciones
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    return mediaQuery.matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (event) => setPrefersReducedMotion(event.matches)

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}
