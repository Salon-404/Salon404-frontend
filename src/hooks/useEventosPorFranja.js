import { useMemo } from 'react'
import { agruparPorFranja } from '../utils/eventos'

/**
 * Hook que agrupa eventos de un día específico por franja horaria.
 * @param {Array} eventos - Lista de eventos de un día
 * @returns {{ manana: Array, tarde: Array, noche: Array }}
 */
export function useEventosPorFranja(eventos) {
  return useMemo(() => agruparPorFranja(eventos), [eventos])
}
