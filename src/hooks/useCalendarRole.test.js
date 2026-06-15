import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCalendarRole } from './useCalendarRole'
import { ROLES } from '../constants/auth'

describe('useCalendarRole', () => {
  it('devuelve vista publica si user es null', () => {
    const { result } = renderHook(() => useCalendarRole(null))
    expect(result.current).toEqual({
      isAdmin: false,
      vista: 'publica',
      puedeVerDetalle: false,
    })
  })

  it('devuelve vista publica si user es cliente', () => {
    const { result } = renderHook(() => useCalendarRole({ role: ROLES.CLIENTE }))
    expect(result.current).toEqual({
      isAdmin: false,
      vista: 'publica',
      puedeVerDetalle: false,
    })
  })

  it('devuelve vista admin si user es admin', () => {
    const { result } = renderHook(() => useCalendarRole({ role: ROLES.ADMIN }))
    expect(result.current).toEqual({
      isAdmin: true,
      vista: 'admin',
      puedeVerDetalle: true,
    })
  })

  it('memoiza el resultado', () => {
    const user = { role: ROLES.ADMIN }
    const { result, rerender } = renderHook(() => useCalendarRole(user))
    const primera = result.current
    rerender()
    const segunda = result.current
    expect(primera).toBe(segunda)
  })
})
