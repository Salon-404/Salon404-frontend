import { useState, useEffect, useRef } from 'react'
import { getEventos } from '../services/eventosService'

/**
 * Hook para obtener la lista unificada de eventos con filtros.
 * @param {Object} filtrosIniciales - Filtros iniciales aplicados al listado.
 * @param {number} debounceMs - Tiempo de debounce para cambios de filtros.
 * @returns {Object} { eventos, loading, error, filtros, setFiltros, refetch }
 */
export function useEventos(filtrosIniciales = {}, debounceMs = 300) {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtros, setFiltros] = useState(filtrosIniciales)
  const abortControllerRef = useRef(null)
  const isFirstRenderRef = useRef(true)

  const fetchEventos = async () => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const data = await getEventos(filtros, abortControllerRef.current.signal)
      setEventos(data)
    } catch (err) {
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') return
      setError(err.message || 'Error al obtener eventos')
      setEventos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      fetchEventos()
      return () => {
        abortControllerRef.current?.abort()
      }
    }

    const timeout = setTimeout(fetchEventos, debounceMs)
    return () => {
      clearTimeout(timeout)
      abortControllerRef.current?.abort()
    }
  }, [
    filtros.estado,
    filtros.tipoEventoId,
    filtros.fechaDesde,
    filtros.fechaHasta,
    filtros.eventOwner,
    filtros.busqueda,
    debounceMs,
  ])

  return { eventos, loading, error, filtros, setFiltros, refetch: fetchEventos }
}
