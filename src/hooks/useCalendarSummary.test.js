import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCalendarSummary } from './useCalendarSummary'

describe('useCalendarSummary', () => {
  const fechaHoy = '2026-06-13'

  it('devuelve stats vacíos si eventos es null', () => {
    const { result } = renderHook(() => useCalendarSummary(null, fechaHoy))
    expect(result.current).toEqual({
      total: 0,
      proximoEvento: null,
      diasHastaProximo: null,
      porFranja: { manana: 0, tarde: 0, noche: 0 },
    })
  })

  it('devuelve stats vacíos si eventos es array vacío', () => {
    const { result } = renderHook(() => useCalendarSummary([], fechaHoy))
    expect(result.current.total).toBe(0)
  })

  it('cuenta eventos activos (ignora cancelados)', () => {
    const eventos = [
      { id: 1, fecha: '2026-06-14', estado: 'pendiente', franja: 'manana' },
      { id: 2, fecha: '2026-06-15', estado: 'cancelado', franja: 'tarde' },
    ]
    const { result } = renderHook(() => useCalendarSummary(eventos, fechaHoy))
    expect(result.current.total).toBe(1)
  })

  it('calcula próximo evento', () => {
    const eventos = [
      { id: 1, fecha: '2026-06-20', estado: 'pendiente', franja: 'manana' },
      { id: 2, fecha: '2026-06-15', estado: 'pendiente', franja: 'tarde' },
    ]
    const { result } = renderHook(() => useCalendarSummary(eventos, fechaHoy))
    expect(result.current.proximoEvento.fecha).toBe('2026-06-15')
    expect(result.current.diasHastaProximo).toBe(2)
  })

  it('cuenta eventos por franja', () => {
    const eventos = [
      { id: 1, fecha: '2026-06-14', estado: 'pendiente', franja: 'manana' },
      { id: 2, fecha: '2026-06-15', estado: 'pendiente', franja: 'manana' },
      { id: 3, fecha: '2026-06-16', estado: 'pendiente', franja: 'noche' },
    ]
    const { result } = renderHook(() => useCalendarSummary(eventos, fechaHoy))
    expect(result.current.porFranja.manana).toBe(2)
    expect(result.current.porFranja.tarde).toBe(0)
    expect(result.current.porFranja.noche).toBe(1)
  })
})
