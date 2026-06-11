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
}
