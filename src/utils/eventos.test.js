import { describe, it, expect } from 'vitest'
import {
  agruparPorFranja,
  contarEventosPorDia,
  obtenerFranjasOcupadas,
  filtrarEventosParaVista,
  obtenerEventosPorFecha,
  obtenerProximoEvento,
} from './eventos'

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

describe('contarEventosPorDia', () => {
  it('devuelve 0 si eventos es null', () => {
    expect(contarEventosPorDia(null, '2026-06-14')).toBe(0)
  })

  it('devuelve 0 si fecha es null', () => {
    expect(contarEventosPorDia([], null)).toBe(0)
  })

  it('devuelve 0 si no hay eventos en esa fecha', () => {
    const eventos = [{ fecha: '2026-06-15' }]
    expect(contarEventosPorDia(eventos, '2026-06-14')).toBe(0)
  })

  it('cuenta correctamente eventos en una fecha', () => {
    const eventos = [
      { fecha: '2026-06-14' },
      { fecha: '2026-06-14' },
      { fecha: '2026-06-15' },
    ]
    expect(contarEventosPorDia(eventos, '2026-06-14')).toBe(2)
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

  it('elimina datos privados si vista es publica', () => {
    const resultado = filtrarEventosParaVista([eventoCompleto], 'publica')
    expect(resultado[0]).not.toHaveProperty('nombre')
    expect(resultado[0]).not.toHaveProperty('cliente')
    expect(resultado[0]).not.toHaveProperty('cantidadInvitados')
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

describe('obtenerEventosPorFecha', () => {
  it('devuelve array vacío si eventos es null', () => {
    expect(obtenerEventosPorFecha(null, '2026-06-14')).toEqual([])
  })

  it('devuelve array vacío si fecha es null', () => {
    expect(obtenerEventosPorFecha([], null)).toEqual([])
  })

  it('filtra eventos por fecha', () => {
    const eventos = [
      { id: 1, fecha: '2026-06-14' },
      { id: 2, fecha: '2026-06-15' },
      { id: 3, fecha: '2026-06-14' },
    ]
    const resultado = obtenerEventosPorFecha(eventos, '2026-06-14')
    expect(resultado).toHaveLength(2)
  })
})

describe('obtenerProximoEvento', () => {
  it('devuelve null si eventos es null', () => {
    expect(obtenerProximoEvento(null, '2026-06-14')).toBeNull()
  })

  it('devuelve null si no hay eventos futuros', () => {
    const eventos = [{ fecha: '2026-06-10', estado: 'pendiente' }]
    expect(obtenerProximoEvento(eventos, '2026-06-14')).toBeNull()
  })

  it('ignora eventos cancelados', () => {
    const eventos = [
      { fecha: '2026-06-15', estado: 'cancelado' },
      { fecha: '2026-06-20', estado: 'pendiente' },
    ]
    const resultado = obtenerProximoEvento(eventos, '2026-06-14')
    expect(resultado.fecha).toBe('2026-06-20')
  })

  it('devuelve el evento más próximo', () => {
    const eventos = [
      { fecha: '2026-06-20', estado: 'pendiente' },
      { fecha: '2026-06-15', estado: 'pendiente' },
      { fecha: '2026-06-25', estado: 'pendiente' },
    ]
    const resultado = obtenerProximoEvento(eventos, '2026-06-14')
    expect(resultado.fecha).toBe('2026-06-15')
  })
})
