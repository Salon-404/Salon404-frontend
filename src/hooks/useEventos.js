<<<<<<< HEAD
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
=======
import { useState, useEffect, useCallback } from 'react'
import { getEventos } from '../services/eventosService'

// Formatea un Date local como 'YYYY-MM-DD' sin conversión UTC.
function toLocalDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Obtiene los eventos del mes indicado, ampliado ~7 días en cada extremo
 * para cubrir las celdas líderes/cola de FullCalendar.
 */
export function useEventos(year, month) {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [trigger, setTrigger] = useState(0)

  const reload = useCallback(() => setTrigger((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false

    // Rango: primer día del mes − 7 días hasta último día + 7 días
    const inicio = new Date(year, month - 1, 1 - 7)
    const fin = new Date(year, month, 0 + 7) // last day of month + 7

    const fechaDesde = toLocalDateStr(inicio)
    const fechaHasta = toLocalDateStr(fin)

    setLoading(true)
    setError(null)
    getEventos({ fechaDesde, fechaHasta })
      .then((data) => {
        if (!cancelled) setEventos(data)
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los eventos.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [year, month, trigger])

  return { eventos, loading, error, reload }
>>>>>>> origin/develop
}
