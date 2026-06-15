import { useMemo } from 'react'
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
  }, [eventos, fechaHoy])
}
