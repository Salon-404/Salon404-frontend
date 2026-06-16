import { describe, it, expect } from 'vitest'
import {
  calcularMontoTotal,
  agruparEventosPorFranja,
  filtrarEventos,
  formatearMonto,
} from './eventos'

const eventoBase = (props) => ({
  id: 'evt-001',
  nombre: 'Evento',
  fecha: '2026-07-05',
  horaInicio: '10:00',
  horaFin: '12:00',
  estado: 'pendiente',
  cliente: { nombre: 'Marcela Romero', email: 'mromero@email.com' },
  reserva: { estado: 'pendiente' },
  ...props,
})

describe('calcularMontoTotal', () => {
  it('sin extras devuelve el precio base', () => {
    expect(calcularMontoTotal(120000)).toBe(120000)
  })

  it('suma correctamente los extras', () => {
    expect(calcularMontoTotal(120000, [30000, 50000])).toBe(200000)
  })

  it('con extras vacíos devuelve el precio base', () => {
    expect(calcularMontoTotal(120000, [])).toBe(120000)
  })

  it('rechaza extras negativos', () => {
    expect(() => calcularMontoTotal(120000, [-1])).toThrow('negativos')
  })

  it('rechaza precio base negativo', () => {
    expect(() => calcularMontoTotal(-100)).toThrow('precio base')
  })

  it('rechaza precio base no numérico', () => {
    expect(() => calcularMontoTotal('abc')).toThrow('número')
  })

  it('rechaza extras no numéricos', () => {
    expect(() => calcularMontoTotal(120000, ['abc'])).toThrow('número')
  })
})

describe('agruparEventosPorFranja', () => {
  it('lista vacía devuelve grupos vacíos', () => {
    const resultado = agruparEventosPorFranja([])
    expect(resultado).toEqual({ manana: [], tarde: [], noche: [] })
  })

  it('un evento va al grupo correcto', () => {
    const evento = eventoBase({ horaInicio: '09:00' })
    const resultado = agruparEventosPorFranja([evento])
    expect(resultado.manana).toHaveLength(1)
    expect(resultado.tarde).toHaveLength(0)
    expect(resultado.noche).toHaveLength(0)
  })

  it('agrupa múltiples franjas', () => {
    const eventos = [
      eventoBase({ id: 'evt-001', horaInicio: '09:00' }),
      eventoBase({ id: 'evt-002', horaInicio: '15:00' }),
      eventoBase({ id: 'evt-003', horaInicio: '21:00' }),
    ]
    const resultado = agruparEventosPorFranja(eventos)
    expect(resultado.manana).toHaveLength(1)
    expect(resultado.tarde).toHaveLength(1)
    expect(resultado.noche).toHaveLength(1)
  })

  it('ordena por horaInicio dentro de cada franja', () => {
    const eventos = [
      eventoBase({ id: 'evt-001', horaInicio: '11:00' }),
      eventoBase({ id: 'evt-002', horaInicio: '09:00' }),
      eventoBase({ id: 'evt-003', horaInicio: '10:00' }),
    ]
    const resultado = agruparEventosPorFranja(eventos)
    expect(resultado.manana.map((e) => e.id)).toEqual([
      'evt-002',
      'evt-003',
      'evt-001',
    ])
  })

  it('ignora eventos sin horaInicio', () => {
    const resultado = agruparEventosPorFranja([
      eventoBase({ horaInicio: undefined }),
    ])
    expect(resultado.manana).toHaveLength(0)
  })
})

describe('filtrarEventos', () => {
  const eventos = [
    eventoBase({
      id: 'evt-001',
      nombre: 'Bautismo',
      estado: 'pendiente',
      fecha: '2026-07-05',
      cliente: { nombre: 'Marcela Romero', email: 'mromero@email.com' },
      reserva: { estado: 'pendiente' },
    }),
    eventoBase({
      id: 'evt-002',
      nombre: 'Casamiento',
      estado: 'confirmada',
      fecha: '2026-07-10',
      cliente: { nombre: 'Carlos López', email: 'lopez@email.com' },
      reserva: { estado: 'confirmada' },
    }),
  ]

  it('sin filtros devuelve todos', () => {
    expect(filtrarEventos(eventos)).toHaveLength(2)
  })

  it('filtra por estado de evento', () => {
    const resultado = filtrarEventos(eventos, { estadoEvento: 'pendiente' })
    expect(resultado).toHaveLength(1)
    expect(resultado[0].id).toBe('evt-001')
  })

  it('filtra por estado de reserva', () => {
    const resultado = filtrarEventos(eventos, { estadoReserva: 'confirmada' })
    expect(resultado).toHaveLength(1)
    expect(resultado[0].id).toBe('evt-002')
  })

  it('filtra por rango de fechas', () => {
    const resultado = filtrarEventos(eventos, {
      fechaDesde: '2026-07-01',
      fechaHasta: '2026-07-06',
    })
    expect(resultado).toHaveLength(1)
    expect(resultado[0].id).toBe('evt-001')
  })

  it('filtra por búsqueda de cliente', () => {
    const resultado = filtrarEventos(eventos, { busqueda: 'lopez' })
    expect(resultado).toHaveLength(1)
    expect(resultado[0].id).toBe('evt-002')
  })

  it('filtra por búsqueda de nombre de evento', () => {
    const resultado = filtrarEventos(eventos, { busqueda: 'bautismo' })
    expect(resultado).toHaveLength(1)
    expect(resultado[0].id).toBe('evt-001')
  })

  it('filtros combinados funcionan', () => {
    const resultado = filtrarEventos(eventos, {
      estadoEvento: 'pendiente',
      busqueda: 'marcela',
    })
    expect(resultado).toHaveLength(1)
    expect(resultado[0].id).toBe('evt-001')
  })
})

describe('formatearMonto', () => {
  it('formatea miles con punto', () => {
    expect(formatearMonto(1000)).toBe('$1.000')
  })

  it('formatea millones con puntos', () => {
    expect(formatearMonto(1000000)).toBe('$1.000.000')
  })

  it('formatea cero', () => {
    expect(formatearMonto(0)).toBe('$0')
  })

  it('null o undefined devuelve "$0"', () => {
    expect(formatearMonto(null)).toBe('$0')
    expect(formatearMonto(undefined)).toBe('$0')
  })
})
