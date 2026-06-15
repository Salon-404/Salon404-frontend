import { FRANJAS } from '../constants/eventos'

/**
 * Agrupa eventos por franja horaria (manana/tarde/noche).
 * @param {Array} eventos - Lista de eventos
 * @returns {Object} Objeto con claves manana/tarde/noche, cada una con array de eventos
 */
export function agruparPorFranja(eventos) {
  if (!Array.isArray(eventos) || eventos.length === 0) {
    return { manana: [], tarde: [], noche: [] }
  }

  return eventos.reduce(
    (acc, evento) => {
      const franja = evento.franja
      if (franja && acc[franja]) {
        acc[franja].push(evento)
      }
      return acc
    },
    { manana: [], tarde: [], noche: [] }
  )
}

/**
 * Cuenta cuántos eventos hay en una fecha específica.
 * @param {Array} eventos - Lista de eventos
 * @param {string} fecha - Fecha en formato 'YYYY-MM-DD'
 * @returns {number} Cantidad de eventos en esa fecha
 */
export function contarEventosPorDia(eventos, fecha) {
  if (!Array.isArray(eventos) || !fecha) return 0
  return eventos.filter((e) => e.fecha === fecha).length
}

/**
 * Obtiene las franjas ocupadas en una lista de eventos, ignorando cancelados.
 * @param {Array} eventos - Lista de eventos
 * @returns {Array<string>} Array de franjas únicas ocupadas (ej: ['manana', 'noche'])
 */
export function obtenerFranjasOcupadas(eventos) {
  if (!Array.isArray(eventos)) return []

  const franjasSet = new Set()
  eventos.forEach((evento) => {
    if (evento.estado !== 'cancelado' && evento.franja) {
      franjasSet.add(evento.franja)
    }
  })

  return Array.from(franjasSet)
}

/**
 * Filtra eventos según la vista del usuario.
 * Si la vista es 'publica', elimina datos privados (nombre, cliente, invitados).
 * Si la vista es 'admin', devuelve los eventos completos.
 * @param {Array} eventos - Lista de eventos
 * @param {'admin'|'publica'} vista - Tipo de vista
 * @returns {Array} Eventos filtrados según la vista
 */
export function filtrarEventosParaVista(eventos, vista) {
  if (!Array.isArray(eventos)) return []

  if (vista === 'admin') {
    return eventos
  }

  return eventos.map((evento) => ({
    id: evento.id,
    fecha: evento.fecha,
    horaInicio: evento.horaInicio,
    horaFin: evento.horaFin,
    franja: evento.franja,
    estado: evento.estado,
    tipoEventoId: evento.tipoEventoId,
  }))
}

/**
 * Obtiene eventos de una fecha específica.
 * @param {Array} eventos - Lista de eventos
 * @param {string} fecha - Fecha en formato 'YYYY-MM-DD'
 * @returns {Array} Eventos de esa fecha
 */
export function obtenerEventosPorFecha(eventos, fecha) {
  if (!Array.isArray(eventos) || !fecha) return []
  return eventos.filter((e) => e.fecha === fecha)
}

/**
 * Calcula el próximo evento desde una fecha de referencia.
 * @param {Array} eventos - Lista de eventos
 * @param {string} fechaReferencia - Fecha desde la cual buscar (YYYY-MM-DD)
 * @returns {Object|null} Próximo evento no cancelado, o null si no hay
 */
export function obtenerProximoEvento(eventos, fechaReferencia) {
  if (!Array.isArray(eventos) || !fechaReferencia) return null

  const eventosFuturos = eventos
    .filter((e) => e.fecha >= fechaReferencia && e.estado !== 'cancelado')
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  return eventosFuturos.length > 0 ? eventosFuturos[0] : null
}
