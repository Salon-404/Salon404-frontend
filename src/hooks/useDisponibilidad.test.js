import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDisponibilidad } from './useDisponibilidad'
import * as disponibilidadService from '../services/disponibilidadService'

vi.mock('../services/disponibilidadService')

describe('useDisponibilidad', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devuelve array vacío si no hay fecha', () => {
    const { result } = renderHook(() => useDisponibilidad(null))
    
    expect(result.current.reservas).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('llama al service con la fecha correcta', async () => {
    const mockData = {
      reservas: [
        { id: '1', horaInicio: '10:00', horaFin: '14:00' },
      ],
    }
    
    vi.mocked(disponibilidadService.getDisponibilidad).mockResolvedValue(mockData)
    
    const { result } = renderHook(() => useDisponibilidad('2026-06-15'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(disponibilidadService.getDisponibilidad).toHaveBeenCalledWith('2026-06-15')
    expect(result.current.reservas).toEqual(mockData.reservas)
  })

  it('maneja loading correctamente', async () => {
    vi.mocked(disponibilidadService.getDisponibilidad).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ reservas: [] }), 100))
    )
    
    const { result } = renderHook(() => useDisponibilidad('2026-06-15'))
    
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('maneja errores correctamente', async () => {
    vi.mocked(disponibilidadService.getDisponibilidad).mockRejectedValue(
      new Error('Error de red')
    )
    
    const { result } = renderHook(() => useDisponibilidad('2026-06-15'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.error).toBe('Error de red')
    expect(result.current.reservas).toEqual([])
  })

  it('refetch vuelve a llamar al service', async () => {
    const mockData = { reservas: [] }
    vi.mocked(disponibilidadService.getDisponibilidad).mockResolvedValue(mockData)
    
    const { result } = renderHook(() => useDisponibilidad('2026-06-15'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(disponibilidadService.getDisponibilidad).toHaveBeenCalledTimes(1)
    
    result.current.refetch()
    
    await waitFor(() => {
      expect(disponibilidadService.getDisponibilidad).toHaveBeenCalledTimes(2)
    })
  })

  it('se actualiza cuando cambia la fecha', async () => {
    const mockData1 = { reservas: [{ id: '1' }] }
    const mockData2 = { reservas: [{ id: '2' }] }
    
    vi.mocked(disponibilidadService.getDisponibilidad)
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2)
    
    const { result, rerender } = renderHook(
      ({ fecha }) => useDisponibilidad(fecha),
      { initialProps: { fecha: '2026-06-15' } }
    )
    
    await waitFor(() => {
      expect(result.current.reservas).toEqual(mockData1.reservas)
    })
    
    rerender({ fecha: '2026-06-20' })
    
    await waitFor(() => {
      expect(result.current.reservas).toEqual(mockData2.reservas)
    })
    
    expect(disponibilidadService.getDisponibilidad).toHaveBeenCalledWith('2026-06-15')
    expect(disponibilidadService.getDisponibilidad).toHaveBeenCalledWith('2026-06-20')
  })
})
