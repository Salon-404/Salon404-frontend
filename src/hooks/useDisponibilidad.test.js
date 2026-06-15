import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDisponibilidad } from './useDisponibilidad'
import * as eventosService from '../services/eventosService'

vi.mock('../services/eventosService')

describe('useDisponibilidad', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devuelve array vacío si no hay fecha', () => {
    const { result } = renderHook(() => useDisponibilidad(null))

    expect(result.current.eventos).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('llama al service con la fecha correcta', async () => {
    const mockData = {
      eventos: [
        {
          id: 'evt-001',
          horaInicio: '10:00',
          horaFin: '14:00',
          reserva: { id: 'res-001', estado: 'confirmada' },
        },
      ],
    }

    vi.mocked(eventosService.getDisponibilidad).mockResolvedValue(mockData)

    const { result } = renderHook(() => useDisponibilidad('2026-06-15'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(eventosService.getDisponibilidad).toHaveBeenCalledWith('2026-06-15')
    expect(result.current.eventos).toEqual(mockData.eventos)
  })

  it('maneja loading correctamente', async () => {
    vi.mocked(eventosService.getDisponibilidad).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ eventos: [] }), 100))
    )

    const { result } = renderHook(() => useDisponibilidad('2026-06-15'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('maneja errores correctamente', async () => {
    vi.mocked(eventosService.getDisponibilidad).mockRejectedValue(
      new Error('Error de red')
    )

    const { result } = renderHook(() => useDisponibilidad('2026-06-15'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Error de red')
    expect(result.current.eventos).toEqual([])
  })

  it('refetch vuelve a llamar al service', async () => {
    const mockData = { eventos: [] }
    vi.mocked(eventosService.getDisponibilidad).mockResolvedValue(mockData)

    const { result } = renderHook(() => useDisponibilidad('2026-06-15'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(eventosService.getDisponibilidad).toHaveBeenCalledTimes(1)

    result.current.refetch()

    await waitFor(() => {
      expect(eventosService.getDisponibilidad).toHaveBeenCalledTimes(2)
    })
  })

  it('se actualiza cuando cambia la fecha', async () => {
    const mockData1 = { eventos: [{ id: 'evt-001' }] }
    const mockData2 = { eventos: [{ id: 'evt-002' }] }

    vi.mocked(eventosService.getDisponibilidad)
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2)

    const { result, rerender } = renderHook(
      ({ fecha }) => useDisponibilidad(fecha),
      { initialProps: { fecha: '2026-06-15' } }
    )

    await waitFor(() => {
      expect(result.current.eventos).toEqual(mockData1.eventos)
    })

    rerender({ fecha: '2026-06-20' })

    await waitFor(() => {
      expect(result.current.eventos).toEqual(mockData2.eventos)
    })

    expect(eventosService.getDisponibilidad).toHaveBeenCalledWith('2026-06-15')
    expect(eventosService.getDisponibilidad).toHaveBeenCalledWith('2026-06-20')
  })
})
