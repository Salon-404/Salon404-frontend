import { useMemo } from 'react'

/**
 * Hook que agrupa eventos por fecha.
 * @param {Array} eventos - Lista de eventos
 * @returns {Map<string, Array>} Map con fecha como key y array de eventos como value
 */
export function useEventosPorDia(eventos) {
  return useMemo(() => {
    if (!Array.isArray(eventos)) return new Map()

    const map = new Map()
    eventos.forEach((evento) => {
      if (!evento.fecha) return
      if (!map.has(evento.fecha)) {
        map.set(evento.fecha, [])
      }
      map.get(evento.fecha).push(evento)
    })

    return map
  }, [eventos])
}
