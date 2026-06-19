// Constantes y helpers del módulo de eventos (agenda unificada)

export const FRANJAS = {
  MANANA: {
    value: 'manana',
    label: 'Mañana',
    desde: 6,
    hasta: 14,
    icono: '🌅',
    color: 'text-amber-600 bg-amber-50',
  },
  TARDE: {
    value: 'tarde',
    label: 'Tarde',
    desde: 14,
    hasta: 20,
    icono: '☀️',
    color: 'text-orange-600 bg-orange-50',
  },
  NOCHE: {
    value: 'noche',
    label: 'Noche',
    desde: 20,
    hasta: 6,
    icono: '🌙',
    color: 'text-indigo-600 bg-indigo-50',
  },
}

export const ESTADOS_EVENTO = [
  { value: 'pendiente',   label: 'Pendiente',  badge: 'bg-yellow-100 text-yellow-800' },
  { value: 'en_curso',    label: 'En curso',   badge: 'bg-blue-100 text-blue-800'     },
  { value: 'finalizado',  label: 'Finalizado', badge: 'bg-green-100 text-green-800'   },
  { value: 'cancelado',   label: 'Cancelado',  badge: 'bg-slate-100 text-slate-600'   },
]

export const ESTADOS_RESERVA = [
  { value: 'pendiente',  label: 'Pendiente',  badge: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmada', label: 'Confirmada', badge: 'bg-green-100 text-green-800'   },
  { value: 'expirada',   label: 'Expirada',   badge: 'bg-red-100 text-red-700'       },
  { value: 'cancelada',  label: 'Cancelada',  badge: 'bg-slate-100 text-slate-600'   },
]

/**
 * Determina la franja horaria a partir de la hora de inicio.
 * @param {string} horaInicio - Hora en formato 'HH:mm'
 * @returns {'manana'|'tarde'|'noche'}
 */
export function getFranja(horaInicio) {
  const [hStr] = horaInicio.split(':')
  const h = parseInt(hStr, 10)
  if (h >= 6 && h < 14) return 'manana'
  if (h >= 14 && h < 20) return 'tarde'
  return 'noche'
}

/**
 * Suma minutos a una hora en formato 'HH:mm' y devuelve el resultado en 'HH:mm'.
 * Trunca al día (00:00-23:59); si supera medianoche devuelve la hora del día siguiente.
 * @param {string} horaInicio - Hora base en formato 'HH:mm'
 * @param {number} minutos - Minutos a sumar
 * @returns {string} Hora resultante en formato 'HH:mm'
 */
export function sumarMinutos(horaInicio, minutos) {
  const [hStr, mStr] = horaInicio.split(':')
  const totalMinutos = parseInt(hStr, 10) * 60 + parseInt(mStr, 10) + minutos
  const hFin = Math.floor(totalMinutos / 60) % 24
  const mFin = totalMinutos % 60
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(hFin)}:${pad(mFin)}`
}
