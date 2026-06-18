import { useMemo } from 'react'
import { parseISO, differenceInCalendarDays } from 'date-fns'
import {
  getEventoEstado,
  getEventoFecha,
  getEventoHoraInicio,
} from '../utils/eventos'

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
      .filter((e) => {
        const fecha = getEventoFecha(e)
        return fecha >= fechaHoy && getEventoEstado(e) !== 'cancelado'
      })
      .sort((a, b) => {
        const fechaA = getEventoFecha(a) ?? ''
        const fechaB = getEventoFecha(b) ?? ''
        if (fechaA !== fechaB) return fechaA.localeCompare(fechaB)
        return (getEventoHoraInicio(a) ?? '').localeCompare(getEventoHoraInicio(b) ?? '')
      })

    const proximoEvento = futuros[0] ?? null
    const diasHastaProximo = proximoEvento
      ? differenceInCalendarDays(parseISO(getEventoFecha(proximoEvento)), parseISO(fechaHoy))
      : null

    return { total, diasHastaProximo, proximoEvento }
  }, [eventos, fechaHoy])
}
