import { useState, useEffect } from 'react'
import { getEventos } from '../services/eventosService'

/**
 * Hook para obtener la lista unificada de eventos con filtros.
 * @param {Object} filtrosIniciales - Filtros iniciales aplicados al listado.
 * @returns {Object} { eventos, loading, error, filtros, setFiltros, refetch }
 */
export function useEventos(filtrosIniciales = {}) {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filtros, setFiltros] = useState(filtrosIniciales)

  const fetchEventos = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getEventos(filtros)
      setEventos(data)
    } catch (err) {
      setError(err.message || 'Error al obtener eventos')
      setEventos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEventos()
  }, [
    filtros.estado,
    filtros.tipoEventoId,
    filtros.fechaDesde,
    filtros.fechaHasta,
    filtros.eventOwner,
    filtros.busqueda,
  ])

  return { eventos, loading, error, filtros, setFiltros, refetch: fetchEventos }
}
