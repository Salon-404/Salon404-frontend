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
 */
export function obtenerFranjasOcupadas(eventos) {
  if (!Array.isArray(eventos)) return []

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
}
