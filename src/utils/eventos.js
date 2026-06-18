/**
 * Utilidades puras del módulo de eventos.
 * No tienen efectos secundarios ni dependen del DOM.
 */

const MONTO_MINIMO = 0
const FACTOR_MONTOS = 100

export function getEventoId(evento, fallback) {
  return evento?.id ?? evento?.eventId ?? evento?.reservationId ?? fallback
}

export function getEventoFecha(evento) {
  return evento?.fecha ?? evento?.eventDate ?? evento?.date ?? evento?.reservationDate
}

export function getEventoHoraInicio(evento) {
  return evento?.horaInicio ?? evento?.eventStart ?? evento?.startTime ?? evento?.start
}

export function getEventoHoraFin(evento) {
  return evento?.horaFin ?? evento?.eventFinish ?? evento?.endTime ?? evento?.finish
}

export function getEventoTipoId(evento) {
  return evento?.tipoEventoId ?? evento?.eventTypeId ?? evento?.typeId
}

export function getEventoEstado(evento) {
  return normalizeEstadoEvento(
    evento?.estado ?? evento?.status ?? evento?.statusName ?? evento?.eventStatusId
  )
}

export function getEventoNombre(evento) {
  return evento?.nombre ?? evento?.eventName ?? evento?.name ?? 'Evento'
}

export function getEventoCliente(evento) {
  return evento?.cliente ?? evento?.client ?? evento?.customer
}

export function getEventoClienteNombre(evento) {
  const cliente = getEventoCliente(evento)
  return cliente?.nombre ?? cliente?.name ?? evento?.clientName ?? evento?.customerName
}

export function getEventoInvitados(evento) {
  return evento?.cantidadInvitados ?? evento?.estimatedGuests ?? evento?.estimedGuests ?? evento?.guests
}

export function getEventoReserva(evento) {
  return evento?.reserva ?? evento?.reservation
}

export function getEventoReservaId(evento) {
  return evento?.reservationId ?? evento?.reservaId ?? getEventoReserva(evento)?.id
}

export function getReservaEstado(reserva) {
  return normalizeEstadoReserva(reserva?.estado ?? reserva?.status ?? reserva?.statusName ?? reserva?.statusId)
}

export function getReservaMonto(reserva) {
  return reserva?.montoTotal ?? reserva?.totalAmount ?? reserva?.amount ?? reserva?.price
}

export function getTipoId(tipo) {
  return tipo?.id ?? tipo?.eventTypeId ?? tipo?.typeId
}

export function getTipoNombre(tipo) {
  return tipo?.nombre ?? tipo?.name ?? tipo?.description ?? 'Evento'
}

export function getTipoColor(tipo) {
  return tipo?.color ?? tipo?.colour ?? tipo?.hexColor ?? '#64748b'
}

export function normalizeEstadoEvento(estado) {
  const value = String(estado ?? '').trim().toLowerCase()
  const byId = {
    1: 'pendiente',
    2: 'en_curso',
    3: 'finalizado',
    4: 'cancelado',
  }
  if (byId[value]) return byId[value]
  const normalized = value
    .replaceAll(' ', '_')
    .replace('in_progress', 'en_curso')
    .replace('pending', 'pendiente')
    .replace('finished', 'finalizado')
    .replace('completed', 'finalizado')
    .replace('canceled', 'cancelado')
    .replace('cancelled', 'cancelado')
  return normalized || undefined
}

export function normalizeEstadoReserva(estado) {
  const value = String(estado ?? '').trim().toLowerCase()
  const byId = {
    1: 'pendiente',
    2: 'confirmada',
    3: 'expirada',
    4: 'cancelada',
  }
  if (byId[value]) return byId[value]
  const normalized = value
    .replace('pending', 'pendiente')
    .replace('confirmed', 'confirmada')
    .replace('expired', 'expirada')
    .replace('canceled', 'cancelada')
    .replace('cancelled', 'cancelada')
  return normalized || undefined
}

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
    const horaInicio = getEventoHoraInicio(evento)
    if (!horaInicio) continue
    const franja = getFranja(horaInicio)
    if (grupos[franja]) grupos[franja].push(evento)
  }

  for (const franja of Object.keys(grupos)) {
    grupos[franja].sort((a, b) =>
      (getEventoHoraInicio(a) ?? '').localeCompare(getEventoHoraInicio(b) ?? '')
    )
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

    const estado = getEventoEstado(evento)
    const fecha = getEventoFecha(evento)
    const reserva = getEventoReserva(evento)
    const cliente = getEventoCliente(evento)
    const tipoEventoId = getEventoTipoId(evento)
    const estadoReserva = getReservaEstado(reserva)

    if (filtros.estadoEvento && estado !== filtros.estadoEvento) {
      return false
    }

    if (filtros.estadoReserva && estadoReserva !== filtros.estadoReserva) {
      return false
    }

    if (filtros.tipoEventoId && Number(tipoEventoId) !== Number(filtros.tipoEventoId)) {
      return false
    }

    if (filtros.fechaDesde && fecha < filtros.fechaDesde) {
      return false
    }

    if (filtros.fechaHasta && fecha > filtros.fechaHasta) {
      return false
    }

    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase()
      const campos = [
        getEventoNombre(evento),
        cliente?.nombre ?? cliente?.name,
        cliente?.email,
        evento.eventOwner,
        getEventoReservaId(evento),
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
    const franja = evento?.franja ?? getFranja(getEventoHoraInicio(evento) ?? '')
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
    if (getEventoEstado(evento) === 'cancelado') continue
    const franja = evento?.franja ?? getFranja(getEventoHoraInicio(evento) ?? '')
    if (orden.includes(franja)) ocupadas.add(franja)
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
  return eventos.filter((evento) => getEventoEstado(evento) !== 'cancelado')
}
