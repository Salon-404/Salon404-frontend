import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import EventoEditarPage from './EventoEditarPage'

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
  version: 3,
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
const updateEventoMock = vi.fn()

vi.mock('../../services/eventosService', () => ({
  getEvento: (...args) => getEventoMock(...args),
  updateEvento: (...args) => updateEventoMock(...args),
}))

function renderConRuta(initialEntry = '/eventos/evt-002/editar') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/eventos/:id/editar" element={<EventoEditarPage />} />
        <Route path="/eventos/:id" element={<div data-testid="evento-detail-page">Detalle</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('EventoEditarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getEventoMock.mockResolvedValue(mockEvento)
    updateEventoMock.mockResolvedValue({ ...mockEvento, nombre: 'Nuevo nombre' })
  })

  it('shows loading state while fetching', () => {
    getEventoMock.mockImplementation(() => new Promise(() => {}))
    renderConRuta()

    expect(screen.getByTestId('loading-indicator')).toHaveTextContent('Cargando evento…')
  })

  it('loads event and pre-fills form', async () => {
    renderConRuta()

    await waitFor(() => {
      expect(screen.getByTestId('form-editar-evento')).toBeInTheDocument()
    })

    expect(getEventoMock).toHaveBeenCalledWith('evt-002')
    expect(screen.getByTestId('input-nombre')).toHaveValue('XV de María García')
    expect(screen.getByTestId('input-descripcion')).toHaveValue(
      'Decoración temática rosa y blanco.'
    )
    expect(screen.getByTestId('input-invitados')).toHaveValue(120)
  })

  it('shows error state when fetch fails', async () => {
    getEventoMock.mockRejectedValue({ response: { status: 404 } })
    renderConRuta()

    await waitFor(() => {
      expect(screen.getByTestId('error-indicator')).toBeInTheDocument()
    })

    expect(screen.getByTestId('error-indicator')).toHaveTextContent('Evento no encontrado')
  })

  it('submits update with current version and navigates on success', async () => {
    renderConRuta()

    await waitFor(() => {
      expect(screen.getByTestId('form-editar-evento')).toBeInTheDocument()
    })

    await userEvent.clear(screen.getByTestId('input-nombre'))
    await userEvent.type(screen.getByTestId('input-nombre'), 'Cumple de Juan')
    await userEvent.clear(screen.getByTestId('input-invitados'))
    await userEvent.type(screen.getByTestId('input-invitados'), '80')

    await userEvent.click(screen.getByTestId('btn-guardar'))

    await waitFor(() => {
      expect(updateEventoMock).toHaveBeenCalledTimes(1)
    })

    expect(updateEventoMock).toHaveBeenCalledWith(
      'evt-002',
      {
        nombre: 'Cumple de Juan',
        descripcion: 'Decoración temática rosa y blanco.',
        cantidadInvitados: 80,
        notas: '',
      },
      3
    )

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/eventos/evt-002')
    })
  })

  it('shows conflict error on 409', async () => {
    const conflictError = new Error('Conflict')
    conflictError.response = { status: 409 }
    updateEventoMock.mockRejectedValue(conflictError)

    renderConRuta()

    await waitFor(() => {
      expect(screen.getByTestId('form-editar-evento')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('btn-guardar'))

    await waitFor(() => {
      expect(screen.getByTestId('conflict-error')).toBeInTheDocument()
    })

    expect(screen.getByTestId('conflict-error')).toHaveTextContent(
      'Este evento fue modificado por otro usuario. Recargá la página.'
    )
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('navigates back when cancel is clicked', async () => {
    renderConRuta()

    await waitFor(() => {
      expect(screen.getByTestId('form-editar-evento')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('btn-cancelar'))

    expect(navigateMock).toHaveBeenCalledWith('/eventos/evt-002')
  })

  it('disables submit when required fields are empty', async () => {
    renderConRuta()

    await waitFor(() => {
      expect(screen.getByTestId('form-editar-evento')).toBeInTheDocument()
    })

    await userEvent.clear(screen.getByTestId('input-nombre'))

    expect(screen.getByTestId('btn-guardar')).toBeDisabled()
  })

  it('shows saving state on button while submitting', async () => {
    updateEventoMock.mockImplementation(() => new Promise(() => {}))
    renderConRuta()

    await waitFor(() => {
      expect(screen.getByTestId('form-editar-evento')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('btn-guardar'))

    await waitFor(() => {
      expect(screen.getByTestId('btn-guardar')).toHaveTextContent('Guardando…')
    })

    expect(screen.getByTestId('btn-guardar')).toBeDisabled()
  })
})
