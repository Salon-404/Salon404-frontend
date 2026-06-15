import { describe, it, expect } from 'vitest'
import {
  filtrarReservas,
  ordenarReservas,
  calcularFechaExpiracion,
  estaExpirada,
} from './reservas'

describe('filtrarReservas', () => {
  const reservas = [
    {
      id: '1',
      fecha: '2026-06-15',
      horaInicio: '10:00',
      horaFin: '14:00',
      estado: 'confirmada',
      tipoEventoId: 1,
      cliente: { nombre: 'Juan Pérez', email: 'juan@email.com' },
    },
    {
      id: '2',
      fecha: '2026-06-20',
      horaInicio: '18:00',
      horaFin: '22:00',
      estado: 'pendiente',
      tipoEventoId: 2,
      cliente: { nombre: 'María García', email: 'maria@email.com' },
    },
    {
      id: '3',
      fecha: '2026-06-25',
      horaInicio: '15:00',
      horaFin: '19:00',
      estado: 'cancelada',
      tipoEventoId: 1,
      cliente: { nombre: 'Carlos López', email: 'carlos@email.com' },
    },
    {
      id: '4',
      fecha: '2026-07-01',
      horaInicio: '20:00',
      horaFin: '02:00',
      estado: 'confirmada',
      tipoEventoId: 3,
      cliente: { nombre: 'Ana Martínez', email: 'ana@email.com' },
    },
  ]

  it('devuelve todas las reservas si no hay filtros', () => {
    const resultado = filtrarReservas(reservas, {})
    expect(resultado).toHaveLength(4)
  })

  it('filtra por fecha desde', () => {
    const resultado = filtrarReservas(reservas, { fechaDesde: '2026-06-20' })
    expect(resultado).toHaveLength(3)
    expect(resultado.map(r => r.id)).toEqual(['2', '3', '4'])
  })

  it('filtra por fecha hasta', () => {
    const resultado = filtrarReservas(reservas, { fechaHasta: '2026-06-20' })
    expect(resultado).toHaveLength(2)
    expect(resultado.map(r => r.id)).toEqual(['1', '2'])
  })

  it('filtra por rango de fechas', () => {
    const resultado = filtrarReservas(reservas, {
      fechaDesde: '2026-06-15',
      fechaHasta: '2026-06-25',
    })
    expect(resultado).toHaveLength(3)
    expect(resultado.map(r => r.id)).toEqual(['1', '2', '3'])
  })

  it('filtra por estado', () => {
    const resultado = filtrarReservas(reservas, { estado: 'confirmada' })
    expect(resultado).toHaveLength(2)
    expect(resultado.map(r => r.id)).toEqual(['1', '4'])
  })

  it('filtra por tipo de evento', () => {
    const resultado = filtrarReservas(reservas, { tipoEventoId: 1 })
    expect(resultado).toHaveLength(2)
    expect(resultado.map(r => r.id)).toEqual(['1', '3'])
  })

  it('filtra por nombre de cliente (búsqueda parcial)', () => {
    const resultado = filtrarReservas(reservas, { nombreCliente: 'María' })
    expect(resultado).toHaveLength(1)
    expect(resultado[0].id).toBe('2')
  })

  it('filtra por nombre de cliente (case insensitive)', () => {
    const resultado = filtrarReservas(reservas, { nombreCliente: 'juan' })
    expect(resultado).toHaveLength(1)
    expect(resultado[0].id).toBe('1')
  })

  it('combina múltiples filtros', () => {
    const resultado = filtrarReservas(reservas, {
      fechaDesde: '2026-06-15',
      fechaHasta: '2026-06-30',
      estado: 'confirmada',
    })
    expect(resultado).toHaveLength(1)
    expect(resultado[0].id).toBe('1')
  })

  it('devuelve array vacío si no hay coincidencias', () => {
    const resultado = filtrarReservas(reservas, { estado: 'expirada' })
    expect(resultado).toHaveLength(0)
  })
})

describe('ordenarReservas', () => {
  const reservas = [
    { id: '1', fecha: '2026-06-20', estado: 'pendiente' },
    { id: '2', fecha: '2026-06-15', estado: 'confirmada' },
    { id: '3', fecha: '2026-06-25', estado: 'cancelada' },
  ]

  it('ordena por fecha ascendente', () => {
    const resultado = ordenarReservas(reservas, { campo: 'fecha', orden: 'asc' })
    expect(resultado.map(r => r.id)).toEqual(['2', '1', '3'])
  })

  it('ordena por fecha descendente', () => {
    const resultado = ordenarReservas(reservas, { campo: 'fecha', orden: 'desc' })
    expect(resultado.map(r => r.id)).toEqual(['3', '1', '2'])
  })

  it('ordena por estado', () => {
    const resultado = ordenarReservas(reservas, { campo: 'estado', orden: 'asc' })
    expect(resultado.map(r => r.estado)).toEqual(['cancelada', 'confirmada', 'pendiente'])
  })

  it('devuelve array original si no se especifica ordenamiento', () => {
    const resultado = ordenarReservas(reservas, {})
    expect(resultado.map(r => r.id)).toEqual(['1', '2', '3'])
  })
})

describe('calcularFechaExpiracion', () => {
  it('calcula fecha de expiración 10 minutos después', () => {
    const ahora = new Date('2026-06-13T10:00:00Z')
    const expiracion = calcularFechaExpiracion(ahora, 10)
    expect(expiracion.toISOString()).toBe('2026-06-13T10:10:00.000Z')
  })

  it('calcula fecha de expiración con minutos personalizados', () => {
    const ahora = new Date('2026-06-13T10:00:00Z')
    const expiracion = calcularFechaExpiracion(ahora, 15)
    expect(expiracion.toISOString()).toBe('2026-06-13T10:15:00.000Z')
  })

  it('maneja cambio de hora', () => {
    const ahora = new Date('2026-06-13T10:55:00Z')
    const expiracion = calcularFechaExpiracion(ahora, 10)
    expect(expiracion.toISOString()).toBe('2026-06-13T11:05:00.000Z')
  })
})

describe('estaExpirada', () => {
  it('retorna true si la fecha de expiración ya pasó', () => {
    const expiracion = new Date('2026-06-13T10:00:00Z')
    const ahora = new Date('2026-06-13T10:05:00Z')
    expect(estaExpirada(expiracion, ahora)).toBe(true)
  })

  it('retorna false si la fecha de expiración aún no pasó', () => {
    const expiracion = new Date('2026-06-13T10:10:00Z')
    const ahora = new Date('2026-06-13T10:05:00Z')
    expect(estaExpirada(expiracion, ahora)).toBe(false)
  })

  it('retorna false si la fecha de expiración es exactamente ahora', () => {
    const expiracion = new Date('2026-06-13T10:05:00Z')
    const ahora = new Date('2026-06-13T10:05:00Z')
    expect(estaExpirada(expiracion, ahora)).toBe(false)
  })
})
