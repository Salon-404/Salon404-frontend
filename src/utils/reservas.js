/**
 * Filtra reservas según los criterios proporcionados
 * @param {Array} reservas - Lista de reservas
 * @param {Object} filtros - Criterios de filtrado
 * @param {string} [filtros.fechaDesde] - Fecha desde (YYYY-MM-DD)
 * @param {string} [filtros.fechaHasta] - Fecha hasta (YYYY-MM-DD)
 * @param {string} [filtros.estado] - Estado de la reserva
 * @param {number} [filtros.tipoEventoId] - ID del tipo de evento
 * @param {string} [filtros.nombreCliente] - Nombre del cliente (búsqueda parcial)
 * @returns {Array} Reservas filtradas
 */
export function filtrarReservas(reservas, filtros) {
  let resultado = [...reservas]

  if (filtros.fechaDesde) {
    resultado = resultado.filter(r => r.fecha >= filtros.fechaDesde)
  }

  if (filtros.fechaHasta) {
    resultado = resultado.filter(r => r.fecha <= filtros.fechaHasta)
  }

  if (filtros.estado) {
    resultado = resultado.filter(r => r.estado === filtros.estado)
  }

  if (filtros.tipoEventoId) {
    resultado = resultado.filter(r => r.tipoEventoId === filtros.tipoEventoId)
  }

  if (filtros.nombreCliente) {
    const busqueda = filtros.nombreCliente.toLowerCase()
    resultado = resultado.filter(r =>
      r.cliente?.nombre?.toLowerCase().includes(busqueda)
    )
  }

  return resultado
}

/**
 * Ordena reservas según el campo y orden especificados
 * @param {Array} reservas - Lista de reservas
 * @param {Object} ordenamiento - Criterios de ordenamiento
 * @param {string} [ordenamiento.campo] - Campo por el cual ordenar (fecha, estado)
 * @param {string} [ordenamiento.orden] - Orden de ordenamiento (asc, desc)
 * @returns {Array} Reservas ordenadas
 */
export function ordenarReservas(reservas, ordenamiento) {
  if (!ordenamiento.campo) {
    return [...reservas]
  }

  const resultado = [...reservas]
  const { campo, orden = 'asc' } = ordenamiento
  const multiplicador = orden === 'desc' ? -1 : 1

  resultado.sort((a, b) => {
    if (a[campo] < b[campo]) return -1 * multiplicador
    if (a[campo] > b[campo]) return 1 * multiplicador
    return 0
  })

  return resultado
}

/**
 * Calcula la fecha de expiración sumando minutos a una fecha base
 * @param {Date} fechaBase - Fecha desde la cual calcular
 * @param {number} minutos - Minutos a sumar
 * @returns {Date} Fecha de expiración
 */
export function calcularFechaExpiracion(fechaBase, minutos) {
  const expiracion = new Date(fechaBase)
  expiracion.setMinutes(expiracion.getMinutes() + minutos)
  return expiracion
}

/**
 * Verifica si una reserva ya expiró
 * @param {Date} fechaExpiracion - Fecha de expiración de la reserva
 * @param {Date} [ahora=new Date()] - Fecha actual (para testing)
 * @returns {boolean} True si la reserva ya expiró
 */
export function estaExpirada(fechaExpiracion, ahora = new Date()) {
  return ahora > fechaExpiracion
}
