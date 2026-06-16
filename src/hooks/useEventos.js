import { useState, useEffect, useRef, useCallback } from 'react'
import { getEventos } from '../services/eventosService'
import { filtrarEventos } from '../utils/eventos'

// Formatea un Date local como 'YYYY-MM-DD' sin conversión UTC.
function toLocalDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Hook para obtener la lista unificada de eventos con filtros.
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
      const serviceFiltros = {
        estado: filtros.estado,
        tipoEventoId: filtros.tipoEventoId,
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta,
        eventOwner: filtros.eventOwner,
      }
      const data = await getEventos(serviceFiltros, abortControllerRef.current.signal)
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
      return () => { abortControllerRef.current?.abort() }
    }
    const timeout = setTimeout(fetchEventos, debounceMs)
    return () => {
      clearTimeout(timeout)
      abortControllerRef.current?.abort()
    }
  }, [
    filtros.estado, filtros.estadoEvento, filtros.estadoReserva,
    filtros.tipoEventoId, filtros.fechaDesde, filtros.fechaHasta,
    filtros.eventOwner, filtros.busqueda, debounceMs,
  ])

  return { eventos, loading, error, filtros, setFiltros, refetch: fetchEventos }
}

/**
 * Hook para obtener eventos del mes indicado (usado por el calendario).
 */
export function useEventosPorMes(year, month) {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [trigger, setTrigger] = useState(0)

  const reload = useCallback(() => setTrigger((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    const inicio = new Date(year, month - 1, 1 - 7)
    const fin = new Date(year, month, 0 + 7)
    const fechaDesde = toLocalDateStr(inicio)
    const fechaHasta = toLocalDateStr(fin)

    setLoading(true)
    setError(null)
    getEventos({ fechaDesde, fechaHasta })
      .then((data) => { if (!cancelled) setEventos(data) })
      .catch(() => { if (!cancelled) setError('No se pudieron cargar los eventos.') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [year, month, trigger])

  return { eventos, loading, error, reload }
}