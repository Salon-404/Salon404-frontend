import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TablaReservas from './TablaReservas'
import StatusBadge from './StatusBadge'

vi.mock('./StatusBadge', () => ({
  default: ({ estado }) => <span data-testid={`badge-${estado}`}>{estado}</span>,
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
  {
    id: 2,
    fecha: '2026-06-20',
    horaInicio: '19:00',
    horaFin: '23:00',
    nombreCliente: 'Carlos López',
    tipoEvento: 'casamiento',
    cantidadInvitados: 200,
    estado: 'pendiente',
  },
]

describe('TablaReservas', () => {
  it('renders empty state when reservas is empty', () => {
    render(<TablaReservas reservas={[]} onSeleccionarReserva={vi.fn()} />)
    expect(screen.getByText('No hay reservas para mostrar.')).toBeInTheDocument()
  })

  it('renders one row per reserva', () => {
    render(<TablaReservas reservas={mockReservas} onSeleccionarReserva={vi.fn()} />)
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(3) // header + 2 data rows
  })

  it('shows fecha, horario, cliente, tipo, invitados, estado columns', () => {
    render(<TablaReservas reservas={mockReservas} onSeleccionarReserva={vi.fn()} />)

    expect(screen.getByText('14/06/2026')).toBeInTheDocument()
    expect(screen.getByText('14:00–18:00')).toBeInTheDocument()
    expect(screen.getByText('María García')).toBeInTheDocument()
    expect(screen.getByText('15anos')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByTestId('badge-confirmada')).toBeInTheDocument()

    expect(screen.getByText('20/06/2026')).toBeInTheDocument()
    expect(screen.getByText('19:00–23:00')).toBeInTheDocument()
    expect(screen.getByText('Carlos López')).toBeInTheDocument()
    expect(screen.getByText('casamiento')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
    expect(screen.getByTestId('badge-pendiente')).toBeInTheDocument()
  })

  it('click on row calls onSeleccionarReserva', () => {
    const handleSelect = vi.fn()
    render(<TablaReservas reservas={mockReservas} onSeleccionarReserva={handleSelect} />)

    const firstRow = screen.getAllByRole('row')[1]
    fireEvent.click(firstRow)

    expect(handleSelect).toHaveBeenCalledWith(mockReservas[0])
  })

  it('formats fecha correctly with date-fns', () => {
    render(<TablaReservas reservas={mockReservas} onSeleccionarReserva={vi.fn()} />)
    expect(screen.getByText('14/06/2026')).toBeInTheDocument()
    expect(screen.getByText('20/06/2026')).toBeInTheDocument()
  })
})