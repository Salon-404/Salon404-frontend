import { useState, useEffect, useRef } from 'react'
import { getEventos } from '../services/eventosService'
import { filtrarEventos } from '../utils/eventos'

/**
 * Hook para obtener la lista unificada de eventos con filtros.
 *
 * División de filtros:
 * - Service-side (se envían al backend): estado, tipoEventoId, fechaDesde,
 *   fechaHasta, eventOwner.
 * - Client-side (se aplican sobre la respuesta): estadoEvento, estadoReserva,
 *   busqueda. Estos campos no forman parte del contrato del servicio porque
 *   operan sobre el evento y su reserva embebida de forma separada.
 *
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
      // Filtros que entiende el servicio (backend).
      const serviceFiltros = {
        estado: filtros.estado,
        tipoEventoId: filtros.tipoEventoId,
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta,
        eventOwner: filtros.eventOwner,
      }

      const data = await getEventos(
        serviceFiltros,
        abortControllerRef.current.signal
      )

      // Filtros aplicados localmente sobre el resultado del servicio.
      const filtered = filtrarEventos(data, {
        estadoEvento: filtros.estadoEvento,
        estadoReserva: filtros.estadoReserva,
        busqueda: filtros.busqueda,
      })

      setEventos(filtered)
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
    filtros.estadoEvento,
    filtros.estadoReserva,
    filtros.tipoEventoId,
    filtros.fechaDesde,
    filtros.fechaHasta,
    filtros.eventOwner,
    filtros.busqueda,
    debounceMs,
  ])

  return { eventos, loading, error, filtros, setFiltros, refetch: fetchEventos }
}
