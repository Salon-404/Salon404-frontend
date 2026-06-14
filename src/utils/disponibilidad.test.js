import { describe, it, expect } from 'vitest'
import {
  calcularHorariosDisponibles,
  seSolapan,
  validarHorarioEnVentana,
  convertirHoraAMinutos,
  convertirMinutosAHora,
} from './disponibilidad'

describe('convertirHoraAMinutos', () => {
  it('convierte hora a minutos desde medianoche', () => {
    expect(convertirHoraAMinutos('00:00')).toBe(0)
    expect(convertirHoraAMinutos('08:00')).toBe(480)
    expect(convertirHoraAMinutos('12:30')).toBe(750)
    expect(convertirHoraAMinutos('23:59')).toBe(1439)
  })

  it('maneja horas que cruzan medianoche', () => {
    expect(convertirHoraAMinutos('03:00')).toBe(180)
  })
})

describe('convertirMinutosAHora', () => {
  it('convierte minutos desde medianoche a hora', () => {
    expect(convertirMinutosAHora(0)).toBe('00:00')
    expect(convertirMinutosAHora(480)).toBe('08:00')
    expect(convertirMinutosAHora(750)).toBe('12:30')
    expect(convertirMinutosAHora(1439)).toBe('23:59')
  })

  it('maneja minutos que cruzan medianoche', () => {
    expect(convertirMinutosAHora(1620)).toBe('03:00') // 27 horas = 03:00 del día siguiente
  })
})

describe('seSolapan', () => {
  it('detecta solapamiento parcial', () => {
    expect(seSolapan(480, 720, 600, 840)).toBe(true) // 08:00-12:00 vs 10:00-14:00
  })

  it('detecta solapamiento total (uno dentro del otro)', () => {
    expect(seSolapan(480, 840, 600, 720)).toBe(true) // 08:00-14:00 vs 10:00-12:00
    expect(seSolapan(600, 720, 480, 840)).toBe(true) // 10:00-12:00 vs 08:00-14:00
  })

  it('detecta cuando no hay solapamiento', () => {
    expect(seSolapan(480, 600, 720, 840)).toBe(false) // 08:00-10:00 vs 12:00-14:00
    expect(seSolapan(720, 840, 480, 600)).toBe(false) // 12:00-14:00 vs 08:00-10:00
  })

  it('detecta cuando los horarios son exactamente iguales', () => {
    expect(seSolapan(480, 600, 480, 600)).toBe(true) // 08:00-10:00 vs 08:00-10:00
  })

  it('no considera solapamiento cuando un horario termina exactamente donde empieza el otro', () => {
    expect(seSolapan(480, 600, 600, 720)).toBe(false) // 08:00-10:00 vs 10:00-12:00
  })
})

describe('validarHorarioEnVentana', () => {
  it('valida horario dentro de ventana', () => {
    expect(validarHorarioEnVentana(480, 720, 480, 1320)).toBe(true) // 08:00-12:00 en ventana 08:00-22:00
  })

  it('rechaza horario que empieza antes de apertura', () => {
    expect(validarHorarioEnVentana(420, 600, 480, 1320)).toBe(false) // 07:00-10:00 en ventana 08:00-22:00
  })

  it('rechaza horario que termina después de cierre', () => {
    expect(validarHorarioEnVentana(1200, 1380, 480, 1320)).toBe(false) // 20:00-23:00 en ventana 08:00-22:00
  })

  it('maneja ventana que cruza medianoche', () => {
    // Ventana 22:00-03:00 (1320-180+1440=1620)
    expect(validarHorarioEnVentana(1320, 1500, 1320, 1620)).toBe(true) // 22:00-01:00
    expect(validarHorarioEnVentana(1440, 1620, 1320, 1620)).toBe(true) // 00:00-03:00
  })
})

describe('calcularHorariosDisponibles', () => {
  const configSalon = {
    horarios: {
      lunes: { apertura: '08:00', cierre: '22:00', abierto: true },
    },
    tiempoLimpiezaMinutos: 120, // 2 horas
  }

  const tipoEvento = {
    id: 1,
    duracionMaximaMinutos: 240, // 4 horas
  }

  it('devuelve todos los horarios cuando no hay reservas', () => {
    const horarios = calcularHorariosDisponibles(
      '2026-06-15', // lunes
      tipoEvento,
      [],
      configSalon
    )
    
    // Ventana 08:00-22:00 (14 horas), evento 4 horas, incrementos de 30 min
    // Horarios posibles: 08:00, 08:30, 09:00, ..., 18:00 (último que termina antes de 22:00)
    expect(horarios.length).toBeGreaterThan(0)
    expect(horarios[0].inicio).toBe('08:00')
    expect(horarios[0].fin).toBe('12:00')
  })

  it('filtra horarios que se solapan con reservas existentes', () => {
    const reservas = [
      { horaInicio: '10:00', horaFin: '14:00' }, // Ocupa 10:00-16:00 (con limpieza)
    ]
    
    const horarios = calcularHorariosDisponibles(
      '2026-06-15',
      tipoEvento,
      reservas,
      configSalon
    )
    
    // No debería haber horarios que empiecen entre 10:00 y 16:00
    const horariosConflicto = horarios.filter(h => {
      const inicio = convertirHoraAMinutos(h.inicio)
      return inicio >= 600 && inicio < 960 // 10:00-16:00
    })
    
    expect(horariosConflicto.length).toBe(0)
  })

  it('devuelve array vacío cuando no hay horarios disponibles', () => {
    const reservas = [
      { horaInicio: '08:00', horaFin: '22:00' }, // Todo el día ocupado
    ]
    
    const horarios = calcularHorariosDisponibles(
      '2026-06-15',
      tipoEvento,
      reservas,
      configSalon
    )
    
    expect(horarios.length).toBe(0)
  })

  it('devuelve array vacío si duración del evento es mayor que ventana', () => {
    const tipoEventoLargo = {
      id: 2,
      duracionMaximaMinutos: 900, // 15 horas
    }
    
    const horarios = calcularHorariosDisponibles(
      '2026-06-15',
      tipoEventoLargo,
      [],
      configSalon
    )
    
    expect(horarios.length).toBe(0)
  })

  it('usa incrementos de 30 minutos', () => {
    const horarios = calcularHorariosDisponibles(
      '2026-06-15',
      tipoEvento,
      [],
      configSalon
    )
    
    // Verificar que todos los horarios empiezan en :00 o :30
    horarios.forEach(h => {
      const minutos = convertirHoraAMinutos(h.inicio)
      expect(minutos % 30).toBe(0)
    })
  })
})
