import { describe, it, expect, vi } from 'vitest'
import { esAdmin, decodificarToken, esTokenValido, determinarVista } from './seguridad'
import { ROLES } from '../constants/auth'

describe('esAdmin', () => {
  it('devuelve false si user es null', () => {
    expect(esAdmin(null)).toBe(false)
  })

  it('devuelve false si user no tiene role', () => {
    expect(esAdmin({ name: 'Juan' })).toBe(false)
  })

  it('devuelve false si role es cliente', () => {
    expect(esAdmin({ role: ROLES.CLIENTE })).toBe(false)
  })

  it('devuelve true si role es admin', () => {
    expect(esAdmin({ role: ROLES.ADMIN })).toBe(true)
  })
})

describe('decodificarToken', () => {
  it('devuelve null si token es null', () => {
    expect(decodificarToken(null)).toBeNull()
  })

  it('devuelve null si token no es string', () => {
    expect(decodificarToken(123)).toBeNull()
  })

  it('devuelve null si token es string vacío', () => {
    expect(decodificarToken('')).toBeNull()
  })
})

describe('esTokenValido', () => {
  it('devuelve false si token es null', () => {
    expect(esTokenValido(null)).toBe(false)
  })

  it('devuelve false si token no es string', () => {
    expect(esTokenValido(123)).toBe(false)
  })

  it('devuelve false si token es string vacío', () => {
    expect(esTokenValido('')).toBe(false)
  })
})

describe('determinarVista', () => {
  it('devuelve vista publica si user es null', () => {
    const resultado = determinarVista(null)
    expect(resultado).toEqual({
      isAdmin: false,
      vista: 'publica',
      puedeVerDetalle: false,
    })
  })

  it('devuelve vista publica si user es cliente', () => {
    const resultado = determinarVista({ role: ROLES.CLIENTE })
    expect(resultado).toEqual({
      isAdmin: false,
      vista: 'publica',
      puedeVerDetalle: false,
    })
  })

  it('devuelve vista admin si user es admin', () => {
    const resultado = determinarVista({ role: ROLES.ADMIN })
    expect(resultado).toEqual({
      isAdmin: true,
      vista: 'admin',
      puedeVerDetalle: true,
    })
  })
})
