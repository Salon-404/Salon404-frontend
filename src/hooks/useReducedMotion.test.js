import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useReducedMotion } from './useReducedMotion'

describe('useReducedMotion', () => {
  it('devuelve boolean', () => {
    const { result } = renderHook(() => useReducedMotion())
    expect(typeof result.current).toBe('boolean')
  })
})
