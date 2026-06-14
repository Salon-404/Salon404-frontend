import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import EventoNuevoPage from './EventoNuevoPage'

const usuarioMock = {
  id: 'user-guid-101',
  nombre: 'Marcela Romero',
  email: 'mromero@email.com',
  telefono: '+54 11 4321-0011',
}

const tiposEventoMock = [
  { id: 5, nombre: 'Bautismo', duracionMaximaMinutos: 240, precioBase: 120000 },
]

const horariosMock = [
  { inicio: '09:00', fin: '12:00' },
  { inicio: '14:00', fin: '18:00' },
]

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: usuarioMock }),
}))

vi.mock('../../hooks/useHorariosDisponibles', () => ({
  useHorariosDisponibles: () => ({
    horarios: horariosMock,
    loading: false,
    tiposEvento: tiposEventoMock,
    refetch: vi.fn(),
  }),
}))

const bloquearMock = vi.fn()
const liberarMock = vi.fn()

vi.mock('../../hooks/useBloqueoHorario', () => ({
  useBloqueoHorario: () => ({
    segundosRestantes: 600,
    bloquear: bloquearMock,
    liberar: liberarMock,
  }),
}))

vi.mock('../../services/eventosService', async () => {
  const actual = await vi.importActual('../../services/eventosService')
  return {
    ...actual,
    createEvento: vi.fn(),
  }
})

import { createEvento } from '../../services/eventosService'

function renderConRutas() {
  return render(
    <MemoryRouter initialEntries={['/eventos/nuevo']}>
      <Routes>
        <Route path="/eventos/nuevo" element={<EventoNuevoPage />} />
        <Route path="/eventos" element={<div data-testid="eventos-page">Lista de eventos</div>} />
      </Routes>
    </MemoryRouter>
  )
}

async function avanzarAlFormulario() {
  fireEvent.click(screen.getByRole('gridcell', { name: /20 de junio, disponible/i }))
  await waitFor(() => {
    expect(screen.getByTestId('select-tipo-evento')).toBeInTheDocument()
  })

  fireEvent.change(screen.getByTestId('select-tipo-evento'), { target: { value: '5' } })
  fireEvent.click(screen.getByTestId('btn-siguiente-tipo'))
  await waitFor(() => {
    expect(screen.getByTestId('selector-horarios')).toBeInTheDocument()
  })

  fireEvent.click(screen.getByText('09:00 - 12:00'))
  await waitFor(() => {
    expect(screen.getByTestId('formulario-reserva')).toBeInTheDocument()
  })
}

describe('EventoNuevoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    bloquearMock.mockResolvedValue({
      id: 'reserva-temp-1',
      expirationAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    })
    createEvento.mockResolvedValue({ id: 'evt-nuevo' })
  })

  it('renderiza el wizard completo', () => {
    renderConRutas()
    expect(screen.getByTestId('evento-nuevo-page')).toBeInTheDocument()
    expect(screen.getByText('Nuevo Evento')).toBeInTheDocument()
    expect(screen.getByTestId('calendario-disponibilidad')).toBeInTheDocument()
  })

  it('la selección de fecha y horario avanza por el wizard', async () => {
    renderConRutas()
    await avanzarAlFormulario()

    expect(bloquearMock).toHaveBeenCalledWith(
      {
        fecha: '2026-06-20',
        horaInicio: '09:00',
        horaFin: '12:00',
        tipoEventoId: 5,
      },
      expect.any(Function)
    )
    expect(screen.getByTestId('countdown-reserva')).toBeInTheDocument()
  })

  it('el campo descripcion aparece en el formulario y valida máximo 500 caracteres', async () => {
    renderConRutas()
    await avanzarAlFormulario()

    const inputDescripcion = screen.getByTestId('input-descripcion')
    expect(inputDescripcion).toBeInTheDocument()
    expect(inputDescripcion).toHaveAttribute('maxLength', '500')

    fireEvent.change(inputDescripcion, { target: { value: 'a'.repeat(501) } })
    expect(screen.getByTestId('btn-siguiente')).toBeDisabled()
  })

  it('submit llama a createEvento con el payload correcto y redirige a /eventos', async () => {
    renderConRutas()

    await avanzarAlFormulario()

    fireEvent.change(screen.getByTestId('input-nombre'), {
      target: { value: 'Bautismo Valentino' },
    })
    fireEvent.change(screen.getByTestId('input-descripcion'), {
      target: { value: 'Celebración de bautismo con almuerzo.' },
    })
    fireEvent.change(screen.getByTestId('input-invitados'), { target: { value: '150' } })

    fireEvent.click(screen.getByTestId('btn-siguiente'))
    fireEvent.click(screen.getByTestId('btn-confirmar'))

    await waitFor(() => {
      expect(createEvento).toHaveBeenCalledTimes(1)
    })

    const payload = createEvento.mock.calls[0][0]
    expect(payload.nombre).toBe('Bautismo Valentino')
    expect(payload.descripcion).toBe('Celebración de bautismo con almuerzo.')
    expect(payload.tipoEventoId).toBe(5)
    expect(payload.fecha).toBe('2026-06-20')
    expect(payload.horaInicio).toBe('09:00')
    expect(payload.horaFin).toBe('12:00')
    expect(payload.eventOwner).toBe('user-guid-101')
    expect(payload.cliente).toEqual({
      id: 'user-guid-101',
      nombre: 'Marcela Romero',
      email: 'mromero@email.com',
      telefono: '+54 11 4321-0011',
    })
    expect(payload.reserva.estado).toBe('pendiente')
    expect(typeof payload.reserva.montoTotal).toBe('number')
    expect(payload.reserva.expiraEn).toBeDefined()

    await waitFor(() => {
      expect(screen.getByTestId('evento-nuevo-exito')).toBeInTheDocument()
    })

    await waitFor(
      () => {
        expect(navigateMock).toHaveBeenCalledWith('/eventos')
      },
      { timeout: 4000 }
    )
  })
})
