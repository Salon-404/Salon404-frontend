import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventoDetalleModal from './EventoDetalleModal'

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

const tiposById = {
  1: { id: 1, nombre: 'XV' },
}

function renderModal(props = {}) {
  return render(
    <EventoDetalleModal
      evento={mockEvento}
      abierto={true}
      onCerrar={vi.fn()}
      onEditar={vi.fn()}
      onCancelarEvento={vi.fn()}
      onCancelarReserva={vi.fn()}
      tiposById={tiposById}
      {...props}
    />
  )
}

describe('EventoDetalleModal', () => {
  it('does not render when abierto is false', () => {
    render(<EventoDetalleModal evento={mockEvento} abierto={false} />)
    expect(screen.queryByTestId('modal-detalle')).not.toBeInTheDocument()
  })

  it('renders all event data', () => {
    renderModal()

    expect(screen.getByTestId('modal-titulo')).toHaveTextContent('XV de María García')
    expect(screen.getByTestId('detalle-tipo')).toHaveTextContent('XV')
    expect(screen.getByTestId('detalle-fecha')).toHaveTextContent('14/06/2026')
    expect(screen.getByTestId('detalle-horario')).toHaveTextContent('14:00–18:00')
    expect(screen.getByTestId('detalle-franja')).toHaveTextContent('tarde')
    expect(screen.getByTestId('detalle-invitados')).toHaveTextContent('120')
    expect(screen.getByTestId('detalle-descripcion')).toHaveTextContent(
      'Decoración temática rosa y blanco.'
    )
  })

  it('shows estado badges', () => {
    renderModal()

    expect(screen.getByTestId('estado-evento-badge')).toHaveTextContent('En curso')
    const reservaBadges = screen.getAllByTestId('estado-reserva-badge')
    expect(reservaBadges).toHaveLength(2)
    reservaBadges.forEach((badge) => expect(badge).toHaveTextContent('Confirmada'))
  })

  it('shows client data', () => {
    renderModal()

    expect(screen.getByTestId('detalle-cliente-nombre')).toHaveTextContent('María García')
    expect(screen.getByTestId('detalle-cliente-email')).toHaveTextContent('garcia@email.com')
    expect(screen.getByTestId('detalle-cliente-telefono')).toHaveTextContent('+54 11 1234-5678')
  })

  it('shows reservation data and formatted monto', () => {
    renderModal()

    expect(screen.getByTestId('detalle-monto')).toHaveTextContent('$300.000')
    expect(screen.getByTestId('detalle-fecha-pago')).toHaveTextContent('11/05/2026')
    expect(screen.getByTestId('detalle-expiracion')).toHaveTextContent('17/05/2026')
  })

  it('calls onEditar when edit button is clicked', async () => {
    const onEditar = vi.fn()
    renderModal({ onEditar })

    await userEvent.click(screen.getByTestId('btn-editar'))

    expect(onEditar).toHaveBeenCalledTimes(1)
  })

  it('calls onCerrar when backdrop is clicked', async () => {
    const onCerrar = vi.fn()
    renderModal({ onCerrar })

    await userEvent.click(screen.getByTestId('modal-detalle'))

    expect(onCerrar).toHaveBeenCalledTimes(1)
  })

  it('calls onCancelarEvento and onCancelarReserva when buttons are clicked', async () => {
    const onCancelarEvento = vi.fn()
    const onCancelarReserva = vi.fn()
    renderModal({ onCancelarEvento, onCancelarReserva })

    await userEvent.click(screen.getByTestId('btn-cancelar-evento'))
    await userEvent.click(screen.getByTestId('btn-cancelar-reserva'))

    expect(onCancelarEvento).toHaveBeenCalledTimes(1)
    expect(onCancelarReserva).toHaveBeenCalledTimes(1)
  })
})
