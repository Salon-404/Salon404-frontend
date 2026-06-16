import { useState, useEffect, useMemo } from 'react'
import { getTiposEvento } from '../services/disponibilidadService'

/**
 * Hook para obtener los tipos de evento disponibles.
 * @returns {Object} { tipos, tiposById, loading, error }
 */
export function useTiposEvento() {
  const [tipos, setTipos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
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

  return { tipos, tiposById, loading, error }
}
