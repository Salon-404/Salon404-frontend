import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import EventosPage from './EventosPage'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

const mockEventos = [
  {
    id: 'evt-001',
    nombre: 'Cumpleaños de Juana Perez',
    fecha: '2026-05-30',
    horaInicio: '14:00',
    horaFin: '18:00',
    tipoEventoId: 3,
    estado: 'finalizado',
    cantidadInvitados: 40,
    cliente: { nombre: 'Juana Perez' },
    reserva: { estado: 'pendiente', montoTotal: 120000 },
  },
  {
    id: 'evt-002',
    nombre: 'XV de María García',
    fecha: '2026-06-14',
    horaInicio: '14:00',
    horaFin: '18:00',
    tipoEventoId: 1,
    estado: 'en_curso',
    cantidadInvitados: 120,
    cliente: { nombre: 'María García' },
    reserva: { estado: 'confirmada', montoTotal: 300000 },
  },
]

const useEventosMock = vi.fn()

vi.mock('../../hooks/useEventos', () => ({
  useEventos: (...args) => useEventosMock(...args),
}))

function renderConRutas() {
  return render(
    <MemoryRouter initialEntries={['/eventos']}>
      <Routes>
        <Route path="/eventos" element={<EventosPage />} />
        <Route
          path="/eventos/:id"
          element={<div data-testid="evento-detalle">Detalle</div>}
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('EventosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', () => {
    useEventosMock.mockReturnValue({
      eventos: [],
      loading: true,
      error: null,
      filtros: {},
      setFiltros: vi.fn(),
      refetch: vi.fn(),
    })

    renderConRutas()

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
    expect(screen.getByText('Cargando eventos…')).toBeInTheDocument()
  })

  it('renders list with mock events', () => {
    useEventosMock.mockReturnValue({
      eventos: mockEventos,
      loading: false,
      error: null,
      filtros: {},
      setFiltros: vi.fn(),
      refetch: vi.fn(),
    })

    renderConRutas()

    expect(screen.getByText('Eventos')).toBeInTheDocument()
    expect(screen.getByText('Juana Perez')).toBeInTheDocument()
    expect(screen.getByText('María García')).toBeInTheDocument()
    expect(screen.getByText('$120.000')).toBeInTheDocument()
    expect(screen.getByText('$300.000')).toBeInTheDocument()
  })

  it('shows error state', () => {
    useEventosMock.mockReturnValue({
      eventos: [],
      loading: false,
      error: 'Error al cargar eventos',
      filtros: {},
      setFiltros: vi.fn(),
      refetch: vi.fn(),
    })

    renderConRutas()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Error al cargar eventos'
    )
  })

  it('shows empty state message', () => {
    useEventosMock.mockReturnValue({
      eventos: [],
      loading: false,
      error: null,
      filtros: {},
      setFiltros: vi.fn(),
      refetch: vi.fn(),
    })

    renderConRutas()

    expect(
      screen.getByText('No hay eventos para mostrar.')
    ).toBeInTheDocument()
  })

  it('navigates to event detail when row is clicked', () => {
    useEventosMock.mockReturnValue({
      eventos: mockEventos,
      loading: false,
      error: null,
      filtros: {},
      setFiltros: vi.fn(),
      refetch: vi.fn(),
    })

    renderConRutas()

    const rows = screen.getAllByTestId('evento-card')
    fireEvent.click(rows[0])

    expect(navigateMock).toHaveBeenCalledWith('/eventos/evt-001')
  })
})
