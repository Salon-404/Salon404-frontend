import { useState, useEffect, useMemo } from 'react'
import { getTipos } from '../services/tiposEventoService'

// Fetch de tipos de evento una sola vez; expone tiposById para lookup O(1).
export function useTiposEvento() {
  const [tipos, setTipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getTipos()
      .then((data) => {
        if (!cancelled) setTipos(data)
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los tipos de evento.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const tiposById = useMemo(
    () => Object.fromEntries(tipos.map((t) => [t.id, t])),
    [tipos],
  )

  return { tipos, tiposById, loading, error }
}
