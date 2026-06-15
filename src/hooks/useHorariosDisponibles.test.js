import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useHorariosDisponibles } from './useHorariosDisponibles'
import * as disponibilidadService from '../services/disponibilidadService'
import * as disponibilidadUtils from '../utils/disponibilidad'

vi.mock('../services/disponibilidadService')
vi.mock('../services/eventosService', () => ({
  getDisponibilidad: vi.fn(),
}))

import { getDisponibilidad } from '../services/eventosService'

describe('useHorariosDisponibles', () => {
  const mockConfigSalon = {
    id: 'salon-001',
    horarios: {
      lunes: { apertura: '08:00', cierre: '22:00', abierto: true },
      martes: { apertura: '08:00', cierre: '22:00', abierto: true },
      miercoles: { apertura: '08:00', cierre: '22:00', abierto: true },
      jueves: { apertura: '08:00', cierre: '22:00', abierto: true },
      viernes: { apertura: '10:00', cierre: '03:00', abierto: true },
      sabado: { apertura: '10:00', cierre: '03:00', abierto: true },
      domingo: { apertura: '10:00', cierre: '22:00', abierto: true },
    },
    tiempoLimpiezaMinutos: 120,
  }

  const mockTiposEvento = [
    { id: 1, nombre: 'XV', duracionMaximaMinutos: 360 },
    { id: 3, nombre: 'Cumpleaños', duracionMaximaMinutos: 240 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(disponibilidadService.getConfigSalon).mockResolvedValue(mockConfigSalon)
    vi.mocked(disponibilidadService.getTiposEvento).mockResolvedValue(mockTiposEvento)
    vi.mocked(getDisponibilidad).mockResolvedValue({ eventos: [] })
  })

  it('devuelve array vacío si no hay fecha', async () => {
    const { result } = renderHook(() => useHorariosDisponibles(null, 1))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.horarios).toEqual([])
  })

  it('devuelve array vacío si no hay tipoEventoId', async () => {
    const { result } = renderHook(() => useHorariosDisponibles('2026-06-15', null))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.horarios).toEqual([])
  })

  it('computa horarios usando calcularHorariosDisponibles', async () => {
    const mockHorarios = [{ inicio: '10:00', fin: '14:00' }]
    const spy = vi.spyOn(disponibilidadUtils, 'calcularHorariosDisponibles').mockReturnValue(mockHorarios)

    const { result } = renderHook(() => useHorariosDisponibles('2026-06-15', 1))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await waitFor(() => {
      expect(result.current.horarios).toEqual(mockHorarios)
    })

    expect(spy).toHaveBeenCalledWith(
      '2026-06-15',
      expect.objectContaining({ id: 1 }),
      expect.any(Array),
      mockConfigSalon
    )

    spy.mockRestore()
  })

  it('loading es true inicialmente', () => {
    vi.mocked(disponibilidadService.getConfigSalon).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockConfigSalon), 100))
    )

    const { result } = renderHook(() => useHorariosDisponibles('2026-06-15', 1))

    expect(result.current.loading).toBe(true)
  })

  it('maneja errores del service', async () => {
    vi.mocked(disponibilidadService.getConfigSalon).mockRejectedValue(
      new Error('Error de red')
    )

    const { result } = renderHook(() => useHorariosDisponibles('2026-06-15', 1))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Error de red')
    expect(result.current.horarios).toEqual([])
  })

  it('recomputa cuando cambia la fecha', async () => {
    const spy = vi.spyOn(disponibilidadUtils, 'calcularHorariosDisponibles').mockReturnValue([])

    const { result, rerender } = renderHook(
      ({ fecha }) => useHorariosDisponibles(fecha, 1),
      { initialProps: { fecha: '2026-06-15' } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    rerender({ fecha: '2026-06-20' })

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        '2026-06-20',
        expect.objectContaining({ id: 1 }),
        expect.any(Array),
        mockConfigSalon
      )
    })

    spy.mockRestore()
  })

  it('recomputa cuando cambia el tipoEventoId', async () => {
    const spy = vi.spyOn(disponibilidadUtils, 'calcularHorariosDisponibles').mockReturnValue([])

    const { result, rerender } = renderHook(
      ({ tipoEventoId }) => useHorariosDisponibles('2026-06-15', tipoEventoId),
      { initialProps: { tipoEventoId: 1 } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    rerender({ tipoEventoId: 3 })

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        '2026-06-15',
        expect.objectContaining({ id: 3 }),
        expect.any(Array),
        mockConfigSalon
      )
    })

    spy.mockRestore()
  })

  it('devuelve tiposEvento y configSalon en el resultado', async () => {
    const { result } = renderHook(() => useHorariosDisponibles('2026-06-15', 1))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.configSalon).toEqual(mockConfigSalon)
    expect(result.current.tiposEvento).toEqual(mockTiposEvento)
  })
})
