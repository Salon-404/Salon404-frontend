import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useEventos } from './useEventos'
import * as eventosService from '../services/eventosService'

vi.mock('../services/eventosService')

describe('useEventos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts with loading true and empty eventos', () => {
    vi.mocked(eventosService.getEventos).mockResolvedValue([])

    const { result } = renderHook(() => useEventos())

    expect(result.current.eventos).toEqual([])
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBe(null)
  })

  it('populates eventos and sets loading false on success', async () => {
    const mockEventos = [{ id: 'evt-001', nombre: 'Evento 1' }]
    vi.mocked(eventosService.getEventos).mockResolvedValue(mockEventos)

    const { result } = renderHook(() => useEventos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.eventos).toEqual(mockEventos)
    expect(result.current.error).toBe(null)
  })

  it('sets error and clears eventos on fetch failure', async () => {
    vi.mocked(eventosService.getEventos).mockRejectedValue(
      new Error('Error de red')
    )

    const { result } = renderHook(() => useEventos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Error de red')
    expect(result.current.eventos).toEqual([])
  })

  it('re-fetches when setFiltros changes filters', async () => {
    vi.mocked(eventosService.getEventos).mockResolvedValue([])

    const { result } = renderHook(() => useEventos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(eventosService.getEventos).toHaveBeenCalledWith(
      {},
      expect.any(AbortSignal)
    )

    result.current.setFiltros({ estado: 'pendiente' })

    await waitFor(() => {
      expect(eventosService.getEventos).toHaveBeenCalledWith(
        {
          estado: 'pendiente',
        },
        expect.any(AbortSignal)
      )
    })
  })

  it('refetch calls getEventos again', async () => {
    const mockEventos = [{ id: 'evt-001' }]
    vi.mocked(eventosService.getEventos).mockResolvedValue(mockEventos)

    const { result } = renderHook(() => useEventos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(eventosService.getEventos).toHaveBeenCalledTimes(1)

    result.current.refetch()

    await waitFor(() => {
      expect(eventosService.getEventos).toHaveBeenCalledTimes(2)
    })
  })

  it('debounces rapid filter changes and passes AbortSignal', async () => {
    vi.mocked(eventosService.getEventos).mockResolvedValue([])

    const { result } = renderHook(() => useEventos({}, 50))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(eventosService.getEventos).toHaveBeenCalledTimes(1)

    result.current.setFiltros({ estado: 'pendiente' })
    result.current.setFiltros({ estado: 'en_curso' })
    result.current.setFiltros({ estado: 'finalizado' })

    await waitFor(() => {
      expect(eventosService.getEventos).toHaveBeenCalledTimes(2)
    })

    expect(eventosService.getEventos).toHaveBeenLastCalledWith(
      { estado: 'finalizado' },
      expect.any(AbortSignal)
    )
  })
})
