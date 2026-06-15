import { useState, useEffect, useMemo } from 'react'
<<<<<<< HEAD
import { getTiposEvento } from '../services/disponibilidadService'

/**
 * Hook para obtener los tipos de evento disponibles.
 * @returns {Object} { tipos, tiposById, loading, error }
 */
export function useTiposEvento() {
  const [tipos, setTipos] = useState([])
  const [loading, setLoading] = useState(false)
=======
import { getTipos } from '../services/tiposEventoService'

// Fetch de tipos de evento una sola vez; expone tiposById para lookup O(1).
export function useTiposEvento() {
  const [tipos, setTipos] = useState([])
  const [loading, setLoading] = useState(true)
>>>>>>> origin/develop
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
<<<<<<< HEAD

    async function fetchTipos() {
      setLoading(true)
      setError(null)
      try {
        const data = await getTiposEvento()
        if (!cancelled) setTipos(data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Error al obtener tipos de evento')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTipos()
    return () => {
      cancelled = true
    }
  }, [])

  const tiposById = useMemo(() => {
    const map = {}
    for (const tipo of tipos) {
      map[tipo.id] = tipo
    }
    return map
  }, [tipos])
=======
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
>>>>>>> origin/develop

  return { tipos, tiposById, loading, error }
}
