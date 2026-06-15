import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useReservas } from './useReservas'
import * as reservasService from '../services/reservasService'
import * as reservasUtils from '../utils/reservas'

vi.mock('../services/reservasService')
vi.mock('../utils/reservas')

describe('useReservas', () => {
  const mockReservas = [
    { id: 1, fecha: '2026-06-14', estado: 'confirmada', nombreCliente: 'María García', tipoEvento: '15anos', horaInicio: '14:00', horaFin: '18:00', cantidadInvitados: 120 },
    { id: 2, fecha: '2026-06-20', estado: 'pendiente', nombreCliente: 'Carlos López', tipoEvento: 'casamiento', horaInicio: '19:00', horaFin: '23:00', cantidadInvitados: 200 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    reservasService.getReservas.mockResolvedValue({ data: mockReservas, total: 2, page: 1 })
    reservasUtils.filtrarReservas.mockImplementation((data) => data)
  })

  it('returns initial state (empty reservas, loading=true initially)', () => {
    const { result } = renderHook(() => useReservas())

    expect(result.current.reservas).toEqual([])
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBe(null)
    expect(result.current.filtros).toEqual({
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
      tipoEventoId: null,
      nombreCliente: '',
    })
  })

  it('calls getReservas and sets reservas on success', async () => {
    const { result } = renderHook(() => useReservas())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(reservasService.getReservas).toHaveBeenCalledWith({ estado: '' })
    expect(result.current.reservas).toEqual(mockReservas)
  })

  it('sets error on service failure', async () => {
    reservasService.getReservas.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useReservas())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Network error')
    expect(result.current.reservas).toEqual([])
  })

  it('refetch reloads data', async () => {
    const { result } = renderHook(() => useReservas())

    await waitFor(() => expect(result.current.loading).toBe(false))

    const newReservas = [{ id: 3, fecha: '2026-07-01', estado: 'confirmada', nombreCliente: 'Nuevo Cliente', tipoEvento: 'cumpleanos', horaInicio: '10:00', horaFin: '14:00', cantidadInvitados: 50 }]
    reservasService.getReservas.mockResolvedValueOnce({ data: newReservas, total: 1, page: 1 })

    await act(async () => {
      await result.current.refetch()
    })

    expect(reservasService.getReservas).toHaveBeenCalledTimes(2)
    expect(result.current.reservas).toEqual(newReservas)
  })

  it('setting filtros triggers re-fetch', async () => {
    const { result } = renderHook(() => useReservas())

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.setFiltros({ ...result.current.filtros, estado: 'confirmada' })
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(reservasService.getReservas).toHaveBeenCalledWith({ estado: 'confirmada' })
  })
})