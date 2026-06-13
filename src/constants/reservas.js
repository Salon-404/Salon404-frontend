export const ESTADOS = {
  PENDIENTE: 'pendiente',
  CONFIRMADA: 'confirmada',
  CANCELADA: 'cancelada',
}

export const ESTADOS_OPCIONES = [
  { value: '', label: 'Todas' },
  { value: ESTADOS.PENDIENTE, label: 'Pendiente' },
  { value: ESTADOS.CONFIRMADA, label: 'Confirmada' },
  { value: ESTADOS.CANCELADA, label: 'Cancelada' },
]

export const ESTADO_CLASES = {
  [ESTADOS.CONFIRMADA]: 'bg-green-100 text-green-800',
  [ESTADOS.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
  [ESTADOS.CANCELADA]: 'bg-red-100 text-red-700',
}

export const TIPOS_EVENTO = [
  { value: '15anos', label: 'Fiesta de 15 años' },
  { value: 'casamiento', label: 'Casamiento' },
  { value: 'cumpleanos', label: 'Cumpleaños' },
  { value: 'corporativo', label: 'Corporativo' },
  { value: 'bautismo', label: 'Bautismo' },
  { value: 'otro', label: 'Otro' },
]

export const HORARIOS = [
  { value: 'manana', label: 'Mañana — 10:00 hs' },
  { value: 'tarde', label: 'Tarde — 18:00 hs' },
  { value: 'noche', label: 'Noche — 21:00 hs' },
]

export const MESES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
]

export const CALENDARIO_COLORES = {
  [ESTADOS.CONFIRMADA]: '#166534',
  [ESTADOS.PENDIENTE]: '#854d0e',
  [ESTADOS.CANCELADA]: '#991b1b',
}

export const CALENDARIO_BG = {
  [ESTADOS.CONFIRMADA]: '#dcfce7',
  [ESTADOS.PENDIENTE]: '#fef9c3',
  [ESTADOS.CANCELADA]: '#fee2e2',
}
