import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ModalDetalleReserva from './ModalDetalleReserva'
import StatusBadge from './StatusBadge'

vi.mock('./StatusBadge', () => ({
  default: ({ estado }) => <span data-testid={`badge-${estado}`}>{estado}</span>,
}))

const mockReserva = {
  id: 1,
  fecha: '2026-06-14',
  horaInicio: '14:00',
  horaFin: '18:00',
  nombreCliente: 'María García',
  email: 'garcia@email.com',
  telefono: '+54 11 1234-5678',
  tipoEvento: '15anos',
  cantidadInvitados: 120,
  notas: 'Decoración temática rosa y blanco.',
  estado: 'confirmada',
}

describe('ModalDetalleReserva', () => {
  it('does not render when abierto=false', () => {
    render(<ModalDetalleReserva reserva={mockReserva} abierto={false} onCerrar={vi.fn()} onEditar={vi.fn()} onCancelar={vi.fn()} />)
    expect(screen.queryByText('Detalle de Reserva')).not.toBeInTheDocument()
  })

  it('renders all reserva fields when abierto=true', () => {
    render(<ModalDetalleReserva reserva={mockReserva} abierto={true} onCerrar={vi.fn()} onEditar={vi.fn()} onCancelar={vi.fn()} />)

    expect(screen.getByText('Detalle de Reserva')).toBeInTheDocument()
    expect(screen.getByText('14/06/2026')).toBeInTheDocument()
    expect(screen.getByText('14:00–18:00')).toBeInTheDocument()
    expect(screen.getByText('María García')).toBeInTheDocument()
    expect(screen.getByText('garcia@email.com')).toBeInTheDocument()
    expect(screen.getByText('+54 11 1234-5678')).toBeInTheDocument()
    expect(screen.getByText('Fiesta de 15 años')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('Decoración temática rosa y blanco.')).toBeInTheDocument()
    expect(screen.getByTestId('badge-confirmada')).toBeInTheDocument()
  })

  it('click on Editar calls onEditar', () => {
    const onEditar = vi.fn()
    render(<ModalDetalleReserva reserva={mockReserva} abierto={true} onCerrar={vi.fn()} onEditar={onEditar} onCancelar={vi.fn()} />)

    fireEvent.click(screen.getByText('Editar'))
    expect(onEditar).toHaveBeenCalled()
  })

  it('click on Cerrar calls onCerrar', () => {
    const onCerrar = vi.fn()
    render(<ModalDetalleReserva reserva={mockReserva} abierto={true} onCerrar={onCerrar} onEditar={vi.fn()} onCancelar={vi.fn()} />)

    fireEvent.click(screen.getByText('Cerrar'))
    expect(onCerrar).toHaveBeenCalled()
  })
})