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
