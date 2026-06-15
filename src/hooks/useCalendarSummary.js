import { useMemo } from 'react'
<<<<<<< HEAD
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
=======
import { obtenerProximoEvento, agruparPorFranja } from '../utils/eventos'
import { formatearFechaCorta, diferenciaEnDias } from '../utils/formato'

/**
 * Hook que calcula estadísticas del mes para las cards de resumen.
 * @param {Array} eventos - Lista de eventos del mes
 * @param {string} fechaHoy - Fecha actual en formato YYYY-MM-DD
 * @returns {{ total: number, proximoEvento: Object|null, diasHastaProximo: number|null, porFranja: Object }}
 */
export function useCalendarSummary(eventos, fechaHoy) {
  return useMemo(() => {
    if (!Array.isArray(eventos) || eventos.length === 0) {
      return {
        total: 0,
        proximoEvento: null,
        diasHastaProximo: null,
        porFranja: { manana: 0, tarde: 0, noche: 0 },
      }
    }

    const eventosActivos = eventos.filter((e) => e.estado !== 'cancelado')
    const proximoEvento = obtenerProximoEvento(eventosActivos, fechaHoy)
    const diasHastaProximo = proximoEvento
      ? diferenciaEnDias(fechaHoy, proximoEvento.fecha)
      : null

    const porFranja = agruparPorFranja(eventosActivos)

    return {
      total: eventosActivos.length,
      proximoEvento,
      diasHastaProximo,
      porFranja: {
        manana: porFranja.manana.length,
        tarde: porFranja.tarde.length,
        noche: porFranja.noche.length,
      },
    }
>>>>>>> origin/develop
  }, [eventos, fechaHoy])
}
