// Mock de configuración del salón (horarios de apertura, tiempo de limpieza)
export const configSalonMock = {
  id: 'salon-001',
  nombre: 'Salón 404',
  horarios: {
    lunes: { apertura: '08:00', cierre: '22:00', abierto: true },
    martes: { apertura: '08:00', cierre: '22:00', abierto: true },
    miercoles: { apertura: '08:00', cierre: '22:00', abierto: true },
    jueves: { apertura: '08:00', cierre: '22:00', abierto: true },
    viernes: { apertura: '10:00', cierre: '03:00', abierto: true },
    sabado: { apertura: '10:00', cierre: '03:00', abierto: true },
    domingo: { apertura: '10:00', cierre: '22:00', abierto: true },
  },
  tiempoLimpiezaMinutos: 120, // 2 horas entre eventos
}

// Mock de tipos de evento con duración
export const tiposEventoMock = [
  {
    id: 1,
    nombre: 'XV',
    duracionMaximaMinutos: 360, // 6 horas
    precioBase: 250000,
    color: '#ec4899',
  },
  {
    id: 2,
    nombre: 'Casamiento',
    duracionMaximaMinutos: 480, // 8 horas
    precioBase: 450000,
    color: '#8b5cf6',
  },
  {
    id: 3,
    nombre: 'Cumpleaños',
    duracionMaximaMinutos: 240, // 4 horas
    precioBase: 150000,
    color: '#f59e0b',
  },
  {
    id: 4,
    nombre: 'Corporativo',
    duracionMaximaMinutos: 300, // 5 horas
    precioBase: 200000,
    color: '#3b82f6',
  },
  {
    id: 5,
    nombre: 'Bautismo',
    duracionMaximaMinutos: 240, // 4 horas
    precioBase: 120000,
    color: '#10b981',
  },
  {
    id: 6,
    nombre: 'Otro',
    duracionMaximaMinutos: 180, // 3 horas
    precioBase: 100000,
    color: '#6b7280',
  },
]
