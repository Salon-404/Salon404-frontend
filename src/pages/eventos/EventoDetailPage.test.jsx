import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import EventoDetailPage from './EventoDetailPage'

const mockEvento = {
  id: 'evt-002',
  nombre: 'XV de María García',
  descripcion: 'Decoración temática rosa y blanco.',
  tipoEventoId: 1,
  fecha: '2026-06-14',
  horaInicio: '14:00',
  horaFin: '18:00',
  franja: 'tarde',
  estado: 'en_curso',
  cantidadInvitados: 120,
  version: 1,
  cliente: {
    nombre: 'María García',
    email: 'garcia@email.com',
    telefono: '+54 11 1234-5678',
  },
  reserva: {
    id: 'res-002',
    estado: 'confirmada',
    montoTotal: 300000,
    creadoEn: '2026-05-10T10:00:00Z',
    expiraEn: '2026-05-17T10:00:00Z',
    fechaPago: '2026-05-11T10:00:00Z',
  },
}

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

const getEventoMock = vi.fn()
const updateEstadoEventoMock = vi.fn()
const updateEstadoReservaMock = vi.fn()

vi.mock('../../services/eventosService', () => ({
  getEvento: (...args) => getEventoMock(...args),
  updateEstadoEvento: (...args) => updateEstadoEventoMock(...args),
  updateEstadoReserva: (...args) => updateEstadoReservaMock(...args),
}))

function renderConRuta(initialEntry = '/eventos/evt-002') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/eventos/:id" element={<EventoDetailPage />} />
        <Route path="/eventos/:id/editar" element={<div data-testid="evento-editar-page">Editar</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('EventoDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getEventoMock.mockResolvedValue(mockEvento)
    updateEstadoEventoMock.mockResolvedValue({ ...mockEvento, estado: 'cancelado' })
    updateEstadoReservaMock.mockResolvedValue({ ...mockEvento, reserva: { ...mockEvento.reserva, estado: 'cancelada' } })
  })

  it('shows loading state while fetching', () => {
    getEventoMock.mockImplementation(() => new Promise(() => {}))
    renderConRuta()

    expect(screen.getByTestId('loading-indicator')).toHaveTextContent('Cargando evento…')
  })

  it('loads and displays event data', async () => {
    renderConRuta()

    await waitFor(() => {
      expect(screen.getByTestId('evento-detail-page')).toBeInTheDocument()
    })

    expect(getEventoMock).toHaveBeenCalledWith('evt-002')
    expect(screen.getByTestId('evento-nombre')).toHaveTextContent('XV de María García')
    expect(screen.getByTestId('detalle-tipo')).toHaveTextContent('XV')
    expect(screen.getByTestId('detalle-fecha')).toHaveTextContent('14/06/2026')
    expect(screen.getByTestId('detalle-horario')).toHaveTextContent('14:00–18:00')
    expect(screen.getByTestId('detalle-franja')).toHaveTextContent('tarde')
    expect(screen.getByTestId('detalle-invitados')).toHaveTextContent('120')
    expect(screen.getByTestId('detalle-descripcion')).toHaveTextContent(
      'Decoración temática rosa y blanco.'
    )
  })

  it('shows reservation data', async () => {
    renderConRuta()

    await waitFor(() => {
      expect(screen.getByTestId('evento-detail-page')).toBeInTheDocument()
    })

    expect(screen.getByTestId('detalle-monto')).toHaveTextContent('$300.000')
    expect(screen.getByTestId('detalle-fecha-pago')).toHaveTextContent('11/05/2026')
    expect(screen.getByTestId('detalle-expiracion')).toHaveTextContent('17/05/2026')
  })

  it('shows estado badges', async () => {
    renderConRuta()

    await waitFor(() => {
      expect(screen.getByTestId('evento-detail-page')).toBeInTheDocument()
    })

    expect(screen.getByTestId('estado-evento-badge')).toHaveTextContent('En curso')
    const reservaBadges = screen.getAllByTestId('estado-reserva-badge')
    expect(reservaBadges).toHaveLength(2)
    reservaBadges.forEach((badge) => expect(badge).toHaveTextContent('Confirmada'))
  })

  it('shows error state when fetch fails', async () => {
    getEventoMock.mockRejectedValue(new Error('Network error'))
    renderConRuta()

    await waitFor(() => {
      expect(screen.getByTestId('error-indicator')).toBeInTheDocument()
    })

    expect(screen.getByTestId('error-indicator')).toHaveTextContent('Error al cargar el evento')
  })

  it('navigates to edit page when edit button is clicked', async () => {
    renderConRuta()

    await waitFor(() => {
      expect(screen.getByTestId('evento-detail-page')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('btn-editar'))

    expect(navigateMock).toHaveBeenCalledWith('/eventos/evt-002/editar')
  })

  it('navigates back to list when volver button is clicked', async () => {
    renderConRuta()

    await waitFor(() => {
      expect(screen.getByTestId('evento-detail-page')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('btn-volver'))

    expect(navigateMock).toHaveBeenCalledWith('/eventos')
  })

  it('calls updateEstadoEvento when cancelar evento is clicked', async () => {
    renderConRuta()

    await waitFor(() => {
      expect(screen.getByTestId('evento-detail-page')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('btn-cancelar-evento'))

    await waitFor(() => {
      expect(updateEstadoEventoMock).toHaveBeenCalledWith('evt-002', 'cancelado', 1)
    })
  })

  it('calls updateEstadoReserva when cancelar reserva is clicked', async () => {
    renderConRuta()

    await waitFor(() => {
      expect(screen.getByTestId('evento-detail-page')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('btn-cancelar-reserva'))

    await waitFor(() => {
      expect(updateEstadoReservaMock).toHaveBeenCalledWith('evt-002', 'cancelada', 1)
    })
  })
})
