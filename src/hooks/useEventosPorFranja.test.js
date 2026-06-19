import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useEventosPorFranja } from './useEventosPorFranja'

describe('useEventosPorFranja', () => {
  it('devuelve objeto vacío con arrays vacíos si eventos es null', () => {
    const { result } = renderHook(() => useEventosPorFranja(null))
    expect(result.current).toEqual({ manana: [], tarde: [], noche: [] })
  })

  it('devuelve objeto vacío con arrays vacíos si eventos es array vacío', () => {
    const { result } = renderHook(() => useEventosPorFranja([]))
    expect(result.current).toEqual({ manana: [], tarde: [], noche: [] })
  })

  it('agrupa eventos por franja', () => {
    const eventos = [
      { id: 1, franja: 'manana' },
      { id: 2, franja: 'tarde' },
      { id: 3, franja: 'noche' },
    ]
    const { result } = renderHook(() => useEventosPorFranja(eventos))
    expect(result.current.manana).toHaveLength(1)
    expect(result.current.tarde).toHaveLength(1)
    expect(result.current.noche).toHaveLength(1)
  })

  it('memoiza el resultado', () => {
    const eventos = [{ id: 1, franja: 'manana' }]
    const { result, rerender } = renderHook(() => useEventosPorFranja(eventos))
    const primera = result.current
    rerender()
    const segunda = result.current
    expect(primera).toBe(segunda)
  })
})
