// Tipos de evento disponibles en el salón

/** @type {Array<{id:number, nombre:string, duracionMinutos:number, limpiezaMinutos:number, color:string, activo:boolean}>} */
export const tiposEventoMock = [
  { id: 1, nombre: 'XV',          duracionMinutos: 360, limpiezaMinutos: 120, color: '#a855f7', activo: true },
  { id: 2, nombre: 'Casamiento',  duracionMinutos: 480, limpiezaMinutos: 180, color: '#ec4899', activo: true },
  { id: 3, nombre: 'Cumpleaños',  duracionMinutos: 240, limpiezaMinutos:  90, color: '#3b82f6', activo: true },
  { id: 4, nombre: 'Corporativo', duracionMinutos: 300, limpiezaMinutos: 120, color: '#0891b2', activo: true },
  { id: 5, nombre: 'Bautismo',    duracionMinutos: 180, limpiezaMinutos:  60, color: '#22c55e', activo: true },
  { id: 6, nombre: 'Otro',        duracionMinutos: 240, limpiezaMinutos:  90, color: '#64748b', activo: true },
]
