import { useMemo } from 'react'
import { parseISO, differenceInCalendarDays } from 'date-fns'

/**
 * Calcula el resumen del calendario: total de eventos y próximo evento.
 * @param {Array} eventos - Listado de eventos
 * @param {string} fechaHoy - Fecha de hoy en formato 'YYYY-MM-DD'
 * @returns {{ total: number, diasHastaProximo: number|null, proximoEvento: Object|null }}
 */
export function useCalendarSummary(eventos, fechaHoy) {
  return useMemo(() => {
    const total = Array.isArray(eventos) ? eventos.length : 0
    const futuros = (eventos || [])
      .filter((e) => e.fecha >= fechaHoy && e.estado !== 'cancelado')
      .sort((a, b) => {
        if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha)
        return a.horaInicio.localeCompare(b.horaInicio)
      })

    const proximoEvento = futuros[0] ?? null
    const diasHastaProximo = proximoEvento
      ? differenceInCalendarDays(parseISO(proximoEvento.fecha), parseISO(fechaHoy))
      : null

    return { total, diasHastaProximo, proximoEvento }
  }, [eventos, fechaHoy])
}
