import { describe, it, expect } from 'vitest'
import {
  formatearRangoHorario,
  formatearFecha,
  formatearFechaCorta,
  diferenciaEnDias,
} from './formato'

describe('formatearRangoHorario', () => {
  it('devuelve string vacío si horaInicio es null', () => {
    expect(formatearRangoHorario(null, '13:00')).toBe('')
  })

  it('devuelve string vacío si horaFin es null', () => {
    expect(formatearRangoHorario('09:00', null)).toBe('')
  })

  it('formatea rango horario correctamente', () => {
    expect(formatearRangoHorario('09:00', '13:00')).toBe('09:00 - 13:00')
  })

  it('formatea rango que cruza medianoche', () => {
    expect(formatearRangoHorario('21:00', '03:00')).toBe('21:00 - 03:00')
  })
})

describe('formatearFecha', () => {
  it('devuelve string vacío si fecha es null', () => {
    expect(formatearFecha(null)).toBe('')
  })

  it('devuelve string vacío si fecha es string vacío', () => {
    expect(formatearFecha('')).toBe('')
  })

  it('formatea fecha en español', () => {
    const resultado = formatearFecha('2026-06-14')
    expect(resultado).toContain('14')
    expect(resultado).toContain('junio')
    expect(resultado).toContain('2026')
  })
})

describe('formatearFechaCorta', () => {
  it('devuelve string vacío si fecha es null', () => {
    expect(formatearFechaCorta(null)).toBe('')
  })

  it('formatea fecha corta en español', () => {
    const resultado = formatearFechaCorta('2026-06-14')
    expect(resultado).toContain('14')
    expect(resultado.toLowerCase()).toContain('jun')
  })
})

describe('diferenciaEnDias', () => {
  it('devuelve 0 si fechaDesde es null', () => {
    expect(diferenciaEnDias(null, '2026-06-20')).toBe(0)
  })

  it('devuelve 0 si fechaHasta es null', () => {
    expect(diferenciaEnDias('2026-06-14', null)).toBe(0)
  })

  it('calcula diferencia positiva', () => {
    expect(diferenciaEnDias('2026-06-14', '2026-06-20')).toBe(6)
  })

  it('calcula diferencia negativa', () => {
    expect(diferenciaEnDias('2026-06-20', '2026-06-14')).toBe(-6)
  })

  it('devuelve 0 si las fechas son iguales', () => {
    expect(diferenciaEnDias('2026-06-14', '2026-06-14')).toBe(0)
  })
})
