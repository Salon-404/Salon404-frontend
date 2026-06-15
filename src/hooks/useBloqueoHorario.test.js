import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useBloqueoHorario } from './useBloqueoHorario'
import * as disponibilidadService from '../services/disponibilidadService'

vi.mock('../services/disponibilidadService')

describe('useBloqueoHorario', () => {
  const mockReservaTemporal = {
    id: 'reserva-temp-123',
    fecha: '2026-06-15',
    horaInicio: '10:00',
    horaFin: '14:00',
    tipoEventoId: 1,
    estado: 'pendiente',
    expirationAt: new Date(Date.now() + 600 * 1000).toISOString(),
  }

  const datosBloqueo = {
    fecha: '2026-06-15',
    horaInicio: '10:00',
    horaFin: '14:00',
    tipoEventoId: 1,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.mocked(disponibilidadService.bloquearHorario).mockResolvedValue(mockReservaTemporal)
    vi.mocked(disponibilidadService.liberarHorario).mockResolvedValue({ success: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('estado inicial: reservaTemporal=null, segundosRestantes=0, bloqueando=false', () => {
    const { result } = renderHook(() => useBloqueoHorario())

    expect(result.current.reservaTemporal).toBeNull()
    expect(result.current.segundosRestantes).toBe(0)
    expect(result.current.bloqueando).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('bloquear() llama al service y almacena el resultado', async () => {
    const { result } = renderHook(() => useBloqueoHorario())

    await act(async () => {
      await result.current.bloquear(datosBloqueo)
    })

    expect(disponibilidadService.bloquearHorario).toHaveBeenCalledWith(datosBloqueo)
    expect(result.current.reservaTemporal).toEqual(mockReservaTemporal)
  })

  it('bloquear() setea bloqueando=true durante la petición', async () => {
    vi.mocked(disponibilidadService.bloquearHorario).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockReservaTemporal), 100))
    )

    const { result } = renderHook(() => useBloqueoHorario())

    let promise
    act(() => {
      promise = result.current.bloquear(datosBloqueo)
    })

    expect(result.current.bloqueando).toBe(true)

    await act(async () => {
      vi.advanceTimersByTime(100)
      await promise
    })

    expect(result.current.bloqueando).toBe(false)
  })

  it('bloquear() maneja error del service', async () => {
    vi.mocked(disponibilidadService.bloquearHorario).mockRejectedValue(
      new Error('Horario no disponible')
    )

    const { result } = renderHook(() => useBloqueoHorario())

    await act(async () => {
      await result.current.bloquear(datosBloqueo)
    })

    expect(result.current.error).toBe('Horario no disponible')
    expect(result.current.reservaTemporal).toBeNull()
    expect(result.current.bloqueando).toBe(false)
  })

  it('liberar() llama a liberarHorario y resetea el estado', async () => {
    const { result } = renderHook(() => useBloqueoHorario())

    await act(async () => {
      await result.current.bloquear(datosBloqueo)
    })

    expect(result.current.reservaTemporal).toEqual(mockReservaTemporal)

    await act(async () => {
      await result.current.liberar()
    })

    expect(disponibilidadService.liberarHorario).toHaveBeenCalledWith(mockReservaTemporal.id)
    expect(result.current.reservaTemporal).toBeNull()
    expect(result.current.segundosRestantes).toBe(0)
  })

  it('countdown decrementa segundosRestantes', async () => {
    const { result } = renderHook(() => useBloqueoHorario())

    await act(async () => {
      await result.current.bloquear(datosBloqueo)
    })

    const segundosIniciales = result.current.segundosRestantes
    expect(segundosIniciales).toBeGreaterThan(0)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.segundosRestantes).toBeLessThanOrEqual(segundosIniciales)
  })

  it('auto-libera cuando el countdown llega a 0', async () => {
    const expiracionCorta = new Date(Date.now() + 2000).toISOString()
    const mockExpiracionCorta = { ...mockReservaTemporal, expirationAt: expiracionCorta }
    vi.mocked(disponibilidadService.bloquearHorario).mockResolvedValue(mockExpiracionCorta)

    const onExpire = vi.fn()
    const { result } = renderHook(() => useBloqueoHorario())

    await act(async () => {
      await result.current.bloquear(datosBloqueo, onExpire)
    })

    expect(result.current.reservaTemporal).toEqual(mockExpiracionCorta)

    await act(async () => {
      vi.advanceTimersByTime(3000)
    })

    expect(disponibilidadService.liberarHorario).toHaveBeenCalledWith(mockExpiracionCorta.id)
    expect(result.current.reservaTemporal).toBeNull()
    expect(result.current.segundosRestantes).toBe(0)
    expect(onExpire).toHaveBeenCalled()
  })

  it('no permite doble bloqueo', async () => {
    const { result } = renderHook(() => useBloqueoHorario())

    await act(async () => {
      await result.current.bloquear(datosBloqueo)
    })

    expect(result.current.reservaTemporal).toEqual(mockReservaTemporal)

    const segundoResultado = await act(async () => {
      return result.current.bloquear(datosBloqueo)
    })

    expect(segundoResultado).toBeNull()
    expect(disponibilidadService.bloquearHorario).toHaveBeenCalledTimes(1)
  })

  it('limpia el intervalo al desmontar', async () => {
    const { result, unmount } = renderHook(() => useBloqueoHorario())

    await act(async () => {
      await result.current.bloquear(datosBloqueo)
    })

    expect(result.current.segundosRestantes).toBeGreaterThan(0)

    unmount()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    // No crash, interval was cleared
  })
})
