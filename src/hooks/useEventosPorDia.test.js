import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useEventosPorDia } from './useEventosPorDia'

describe('useEventosPorDia', () => {
  it('devuelve Map vacío si eventos es null', () => {
    const { result } = renderHook(() => useEventosPorDia(null))
    expect(result.current.size).toBe(0)
  })

  it('devuelve Map vacío si eventos es array vacío', () => {
    const { result } = renderHook(() => useEventosPorDia([]))
    expect(result.current.size).toBe(0)
  })

  it('agrupa eventos por fecha', () => {
    const eventos = [
      { id: 1, fecha: '2026-06-14' },
      { id: 2, fecha: '2026-06-14' },
      { id: 3, fecha: '2026-06-15' },
    ]
    const { result } = renderHook(() => useEventosPorDia(eventos))
    expect(result.current.size).toBe(2)
    expect(result.current.get('2026-06-14')).toHaveLength(2)
    expect(result.current.get('2026-06-15')).toHaveLength(1)
  })

  it('ignora eventos sin fecha', () => {
    const eventos = [
      { id: 1, fecha: '2026-06-14' },
      { id: 2, fecha: null },
    ]
    const { result } = renderHook(() => useEventosPorDia(eventos))
    expect(result.current.size).toBe(1)
  })

  it('memoiza el resultado', () => {
    const eventos = [{ id: 1, fecha: '2026-06-14' }]
    const { result, rerender } = renderHook(() => useEventosPorDia(eventos))
    const primera = result.current
    rerender()
    const segunda = result.current
    expect(primera).toBe(segunda)
  })
})
