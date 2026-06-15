import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import EventosPage from './EventosPage'

const useEventosMock = vi.fn()

vi.mock('../../hooks/useEventos', () => ({
  useEventos: (...args) => useEventosMock(...args),
}))

function generarEventos(cantidad) {
  return Array.from({ length: cantidad }, (_, i) => {
    const index = i + 1
    return {
      id: `evt-perf-${String(index).padStart(3, '0')}`,
      nombre: `Evento performance ${index}`,
      fecha: '2026-06-14',
      horaInicio: '14:00',
      horaFin: '18:00',
      tipoEventoId: (index % 5) + 1,
      estado: 'pendiente',
      cantidadInvitados: 50 + (index % 150),
      cliente: {
        nombre: `Cliente ${index}`,
        email: `cliente${index}@email.com`,
      },
      reserva: {
        estado: 'pendiente',
        montoTotal: 100000 + index * 100,
      },
    }
  })
}

function renderConRutas() {
  return render(
    <MemoryRouter initialEntries={['/eventos']}>
      <Routes>
        <Route path="/eventos" element={<EventosPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('EventosPage performance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders 100 events in under 1 second without console errors', () => {
    const cienEventos = generarEventos(100)
    useEventosMock.mockReturnValue({
      eventos: cienEventos,
      loading: false,
      error: null,
      filtros: {},
      setFiltros: vi.fn(),
      refetch: vi.fn(),
    })

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const start = performance.now()
    renderConRutas()
    const duration = performance.now() - start

    expect(screen.getAllByTestId('evento-card')).toHaveLength(100)
    expect(duration).toBeLessThan(1000)
    expect(errorSpy).not.toHaveBeenCalled()

    errorSpy.mockRestore()
  })
})
