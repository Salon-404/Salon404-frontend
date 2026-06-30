import { describe, it, expect } from 'vitest'
import {
  calcularMontoTotal,
  agruparEventosPorFranja,
  filtrarEventos,
  formatearMonto,
  agruparPorFranja,
  obtenerFranjasOcupadas,
  filtrarEventosParaVista,
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

describe('agruparPorFranja', () => {
  it('devuelve objeto vacío con arrays vacíos si no hay eventos', () => {
    const resultado = agruparPorFranja([])
    expect(resultado).toEqual({ manana: [], tarde: [], noche: [] })
  })

  it('devuelve objeto vacío con arrays vacíos si eventos es null', () => {
    const resultado = agruparPorFranja(null)
    expect(resultado).toEqual({ manana: [], tarde: [], noche: [] })
  })

  it('agrupa un evento en la franja mañana', () => {
    const eventos = [
      { id: 1, franja: 'manana', nombre: 'Bautismo' },
    ]
    const resultado = agruparPorFranja(eventos)
    expect(resultado.manana).toHaveLength(1)
    expect(resultado.tarde).toHaveLength(0)
    expect(resultado.noche).toHaveLength(0)
  })

  it('agrupa eventos en las tres franjas', () => {
    const eventos = [
      { id: 1, franja: 'manana', nombre: 'Bautismo' },
      { id: 2, franja: 'tarde', nombre: 'Corporativo' },
      { id: 3, franja: 'noche', nombre: 'Casamiento' },
    ]
    const resultado = agruparPorFranja(eventos)
    expect(resultado.manana).toHaveLength(1)
    expect(resultado.tarde).toHaveLength(1)
    expect(resultado.noche).toHaveLength(1)
  })

  it('agrupa múltiples eventos en la misma franja', () => {
    const eventos = [
      { id: 1, franja: 'noche', nombre: 'Casamiento 1' },
      { id: 2, franja: 'noche', nombre: 'Casamiento 2' },
    ]
    const resultado = agruparPorFranja(eventos)
    expect(resultado.noche).toHaveLength(2)
  })

  it('ignora eventos sin franja válida', () => {
    const eventos = [
      { id: 1, franja: 'manana', nombre: 'Válido' },
      { id: 2, franja: 'invalida', nombre: 'Inválido' },
    ]
    const resultado = agruparPorFranja(eventos)
    expect(resultado.manana).toHaveLength(1)
    expect(resultado.tarde).toHaveLength(0)
    expect(resultado.noche).toHaveLength(0)
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

describe('obtenerFranjasOcupadas', () => {
  it('devuelve array vacío si eventos es null', () => {
    expect(obtenerFranjasOcupadas(null)).toEqual([])
  })

  it('devuelve array vacío si no hay eventos', () => {
    expect(obtenerFranjasOcupadas([])).toEqual([])
  })

  it('ignora eventos cancelados', () => {
    const eventos = [
      { franja: 'manana', estado: 'cancelado' },
      { franja: 'tarde', estado: 'pendiente' },
    ]
    const resultado = obtenerFranjasOcupadas(eventos)
    expect(resultado).toEqual(['tarde'])
  })

  it('deduplica franjas repetidas', () => {
    const eventos = [
      { franja: 'noche', estado: 'pendiente' },
      { franja: 'noche', estado: 'confirmado' },
    ]
    const resultado = obtenerFranjasOcupadas(eventos)
    expect(resultado).toEqual(['noche'])
  })

  it('devuelve todas las franjas ocupadas', () => {
    const eventos = [
      { franja: 'manana', estado: 'pendiente' },
      { franja: 'tarde', estado: 'pendiente' },
      { franja: 'noche', estado: 'pendiente' },
    ]
    const resultado = obtenerFranjasOcupadas(eventos)
    expect(resultado).toHaveLength(3)
    expect(resultado).toContain('manana')
    expect(resultado).toContain('tarde')
    expect(resultado).toContain('noche')
  })
})

describe('filtrarEventosParaVista', () => {
  const eventoCompleto = {
    id: 'evt-001',
    nombre: 'Casamiento García',
    fecha: '2026-06-14',
    horaInicio: '20:00',
    horaFin: '04:00',
    franja: 'noche',
    estado: 'pendiente',
    tipoEventoId: 2,
    cliente: { nombre: 'Juan García', email: 'juan@email.com' },
    cantidadInvitados: 150,
  }

  it('devuelve array vacío si eventos es null', () => {
    expect(filtrarEventosParaVista(null, 'admin')).toEqual([])
  })

  it('devuelve eventos completos si vista es admin', () => {
    const resultado = filtrarEventosParaVista([eventoCompleto], 'admin')
    expect(resultado[0]).toHaveProperty('nombre')
    expect(resultado[0]).toHaveProperty('cliente')
    expect(resultado[0]).toHaveProperty('cantidadInvitados')
  })

  it('filtra eventos cancelados si vista es publica', () => {
    const cancelado = { ...eventoCompleto, id: 'evt-002', estado: 'cancelado' }
    const resultado = filtrarEventosParaVista(
      [eventoCompleto, cancelado],
      'publica',
    )
    expect(resultado).toHaveLength(1)
    expect(resultado[0].id).toBe('evt-001')
  })

  it('mantiene datos básicos en vista publica', () => {
    const resultado = filtrarEventosParaVista([eventoCompleto], 'publica')
    expect(resultado[0]).toHaveProperty('id')
    expect(resultado[0]).toHaveProperty('fecha')
    expect(resultado[0]).toHaveProperty('horaInicio')
    expect(resultado[0]).toHaveProperty('horaFin')
    expect(resultado[0]).toHaveProperty('franja')
    expect(resultado[0]).toHaveProperty('estado')
    expect(resultado[0]).toHaveProperty('tipoEventoId')
  })
})
