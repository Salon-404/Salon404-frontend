/**
 * Formatea un rango horario en formato legible.
 * @param {string} horaInicio - Hora en formato 'HH:mm'
 * @param {string} horaFin - Hora en formato 'HH:mm'
 * @returns {string} Rango formateado (ej: "09:00 - 13:00")
 */
export function formatearRangoHorario(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return ''
  return `${horaInicio} - ${horaFin}`
}

/**
 * Formatea una fecha en formato legible (español).
 * @param {string} fecha - Fecha en formato 'YYYY-MM-DD'
 * @returns {string} Fecha formateada (ej: "14 de junio de 2026")
 */
export function formatearFecha(fecha) {
  if (!fecha) return ''

  try {
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return fecha
  }
}

/**
 * Formatea una fecha corta (día y mes).
 * @param {string} fecha - Fecha en formato 'YYYY-MM-DD'
 * @returns {string} Fecha corta (ej: "14 jun")
 */
export function formatearFechaCorta(fecha) {
  if (!fecha) return ''

  try {
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
    })
  } catch {
    return fecha
  }
}

/**
 * Calcula la diferencia en días entre dos fechas.
 * @param {string} fechaDesde - Fecha desde (YYYY-MM-DD)
 * @param {string} fechaHasta - Fecha hasta (YYYY-MM-DD)
 * @returns {number} Diferencia en días (positivo si fechaHasta > fechaDesde)
 */
export function diferenciaEnDias(fechaDesde, fechaHasta) {
  if (!fechaDesde || !fechaHasta) return 0

  try {
    const desde = new Date(fechaDesde + 'T00:00:00')
    const hasta = new Date(fechaHasta + 'T00:00:00')
    const diffMs = hasta - desde
    return Math.floor(diffMs / (1000 * 60 * 60 * 24))
  } catch {
    return 0
  }
}
