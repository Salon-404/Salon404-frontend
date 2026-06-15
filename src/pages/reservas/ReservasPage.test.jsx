import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ReservasPage from './ReservasPage'
import * as useReservasModule from '../../hooks/useReservas'
import * as reservasService from '../../services/reservasService'

vi.mock('../../hooks/useReservas')
vi.mock('../../services/reservasService')
vi.mock('../../components/auth/UserMenu', () => ({
  default: () => <div data-testid="user-menu">UserMenu</div>,
}))

const mockReservas = [
  {
    id: 1,
    fecha: '2026-06-14',
    horaInicio: '14:00',
    horaFin: '18:00',
    nombreCliente: 'María García',
    tipoEvento: '15anos',
    cantidadInvitados: 120,
    estado: 'confirmada',
  },
]

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>)

describe('ReservasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useReservasModule.useReservas.mockReturnValue({
      reservas: mockReservas,
      loading: false,
      error: null,
      filtros: { estado: '', fechaDesde: '', fechaHasta: '', tipoEventoId: null, nombreCliente: '' },
      setFiltros: vi.fn(),
      refetch: vi.fn(),
    })
    reservasService.updateEstado.mockResolvedValue({ ...mockReservas[0], estado: 'cancelada' })
  })

  it('renders title and filters', () => {
    renderWithRouter(<ReservasPage />)
    expect(screen.getByText('Reservas')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar por cliente...')).toBeInTheDocument()
    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0)
  })

  it('renders loading state', () => {
    useReservasModule.useReservas.mockReturnValueOnce({
      reservas: [],
      loading: true,
      error: null,
      filtros: { estado: '', fechaDesde: '', fechaHasta: '', tipoEventoId: null, nombreCliente: '' },
      setFiltros: vi.fn(),
      refetch: vi.fn(),
    })
    renderWithRouter(<ReservasPage />)
    expect(screen.getByText('Cargando reservas…')).toBeInTheDocument()
  })

  it('renders error state', () => {
    useReservasModule.useReservas.mockReturnValueOnce({
      reservas: [],
      loading: false,
      error: 'Error al cargar',
      filtros: { estado: '', fechaDesde: '', fechaHasta: '', tipoEventoId: null, nombreCliente: '' },
      setFiltros: vi.fn(),
      refetch: vi.fn(),
    })
    renderWithRouter(<ReservasPage />)
    expect(screen.getByText('Error al cargar')).toBeInTheDocument()
  })

  it('click on row opens modal', async () => {
    renderWithRouter(<ReservasPage />)

    const row = screen.getByText('María García').closest('tr')
    fireEvent.click(row)

    await waitFor(() => {
      expect(screen.getByText('Detalle de Reserva')).toBeInTheDocument()
    })

    // "María García" aparece en la tabla Y en el modal. Lo importante es que el modal
    // se abrió (verificado arriba con "Detalle de Reserva").
    expect(screen.getAllByText('María García').length).toBeGreaterThan(1)
  })
})