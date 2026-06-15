<<<<<<< HEAD
/**
 * Utilidades puras del módulo de eventos.
 * No tienen efectos secundarios ni dependen del DOM.
 */

const MONTO_MINIMO = 0
const FACTOR_MONTOS = 100

/**
 * Calcula el monto total de un evento a partir del precio base y extras.
 * @param {number} precioBase - Precio base del tipo de evento
 * @param {number[]} [extras=[]] - Listado de cargos adicionales
 * @returns {number} Monto total
 */
export function calcularMontoTotal(precioBase, extras = []) {
  if (typeof precioBase !== 'number' || Number.isNaN(precioBase)) {
    throw new Error('El precio base debe ser un número')
  }
  if (precioBase < MONTO_MINIMO) {
    throw new Error('El precio base no puede ser negativo')
  }

  const extrasValidados = extras ?? []
  if (!Array.isArray(extrasValidados)) {
    throw new Error('Los extras deben ser un array')
  }

  const totalExtras = extrasValidados.reduce((acumulado, extra) => {
    if (typeof extra !== 'number' || Number.isNaN(extra)) {
      throw new Error('Cada extra debe ser un número')
    }
    if (extra < MONTO_MINIMO) {
      throw new Error('No se permiten extras negativos')
    }
    return acumulado + extra
  }, 0)

  return precioBase + totalExtras
}

/**
 * Agrupa eventos por franja horaria.
 * @param {Array} eventos - Eventos con campo horaInicio
 * @returns {Object} { manana: [...], tarde: [...], noche: [...] }
 */
export function agruparEventosPorFranja(eventos) {
  if (!Array.isArray(eventos)) return { manana: [], tarde: [], noche: [] }

  const grupos = { manana: [], tarde: [], noche: [] }

  for (const evento of eventos) {
    if (!evento?.horaInicio) continue
    const franja = getFranja(evento.horaInicio)
    if (grupos[franja]) grupos[franja].push(evento)
  }

  for (const franja of Object.keys(grupos)) {
    grupos[franja].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  }

  return grupos
}

/**
 * Determina la franja horaria a partir de la hora de inicio.
 * @param {string} horaInicio - Hora en formato 'HH:mm'
 * @returns {'manana'|'tarde'|'noche'}
 */
function getFranja(horaInicio) {
  const [hStr] = horaInicio.split(':')
  const h = parseInt(hStr, 10)
  if (h >= 6 && h < 14) return 'manana'
  if (h >= 14 && h < 20) return 'tarde'
  return 'noche'
}

/**
 * Filtra eventos por estado, fecha y/o búsqueda de cliente.
 * @param {Array} eventos - Listado completo de eventos
 * @param {Object} filtros - Filtros a aplicar
 * @param {string} [filtros.estadoEvento] - Estado del evento
 * @param {string} [filtros.estadoReserva] - Estado de la reserva embebida
 * @param {string} [filtros.fechaDesde] - Fecha mínima (YYYY-MM-DD)
 * @param {string} [filtros.fechaHasta] - Fecha máxima (YYYY-MM-DD)
 * @param {string} [filtros.busqueda] - Texto a buscar en nombre, cliente nombre/email
 * @returns {Array} Eventos filtrados
 */
export function filtrarEventos(eventos, filtros = {}) {
  if (!Array.isArray(eventos)) return []

  return eventos.filter((evento) => {
    if (!evento) return false

    if (filtros.estadoEvento && evento.estado !== filtros.estadoEvento) {
      return false
    }

    if (
      filtros.estadoReserva &&
      evento.reserva?.estado !== filtros.estadoReserva
    ) {
      return false
    }

    if (filtros.fechaDesde && evento.fecha < filtros.fechaDesde) {
      return false
    }

    if (filtros.fechaHasta && evento.fecha > filtros.fechaHasta) {
      return false
    }

    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase()
      const campos = [
        evento.nombre,
        evento.cliente?.nombre,
        evento.cliente?.email,
      ]
      const coincide = campos.some((campo) =>
        campo?.toLowerCase().includes(q)
      )
      if (!coincide) return false
    }

    return true
  })
}

/**
 * Formatea un monto como string en pesos argentinos.
 * @param {number|null|undefined} monto
 * @returns {string} Ej: "$1.000", "$0"
 */
export function formatearMonto(monto) {
  const valor = typeof monto === 'number' && !Number.isNaN(monto) ? monto : 0
  return `$${Math.round(valor)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

/**
 * Agrupa eventos por franja horaria usando el campo `franja`.
 * @param {Array} eventos - Eventos con campo franja
 * @returns {{ manana: Array, tarde: Array, noche: Array }}
 */
export function agruparPorFranja(eventos) {
  if (!Array.isArray(eventos)) return { manana: [], tarde: [], noche: [] }

  const grupos = { manana: [], tarde: [], noche: [] }
  for (const evento of eventos) {
    const franja = evento?.franja
    if (grupos[franja]) grupos[franja].push(evento)
  }
  return grupos
}

/**
 * Devuelve las franjas ocupadas por eventos activos, sin duplicados.
 * Ignora eventos cancelados.
 * @param {Array} eventos - Eventos con campo franja y estado
 * @returns {Array<'manana'|'tarde'|'noche'>}
=======
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
>>>>>>> origin/develop
 */
export function obtenerFranjasOcupadas(eventos) {
  if (!Array.isArray(eventos)) return []

<<<<<<< HEAD
  const orden = ['manana', 'tarde', 'noche']
  const ocupadas = new Set()

  for (const evento of eventos) {
    if (evento?.estado === 'cancelado') continue
    if (orden.includes(evento?.franja)) ocupadas.add(evento.franja)
  }

  return orden.filter((franja) => ocupadas.has(franja))
}

/**
 * Filtra los eventos según la vista del calendario.
 * La vista pública oculta eventos cancelados.
 * @param {Array} eventos - Listado de eventos
 * @param {'admin' | 'public'} vista - Vista actual
 * @returns {Array} Eventos filtrados
 */
export function filtrarEventosParaVista(eventos, vista) {
  if (!Array.isArray(eventos)) return []
  if (vista === 'admin') return eventos
  return eventos.filter((evento) => evento?.estado !== 'cancelado')
=======
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
>>>>>>> origin/develop
}
