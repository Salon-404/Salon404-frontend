import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EventoCard from './EventoCard'

const mockEvento = {
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
}

const tiposById = {
  1: { id: 1, nombre: 'XV' },
}

describe('EventoCard', () => {
  it('renders all columns correctly', () => {
    render(<EventoCard evento={mockEvento} onSeleccionar={vi.fn()} tiposById={tiposById} />)

    expect(screen.getByText('14/06/2026')).toBeInTheDocument()
    expect(screen.getByText('14:00–18:00')).toBeInTheDocument()
    expect(screen.getByText('María García')).toBeInTheDocument()
    expect(screen.getByText('XV')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByTestId('estado-evento-badge')).toHaveTextContent(
      'En curso'
    )
    expect(screen.getByTestId('estado-reserva-badge')).toHaveTextContent(
      'Confirmada'
    )
    expect(screen.getByText('$300.000')).toBeInTheDocument()
  })

  it('calls onSeleccionar with the evento when clicked', () => {
    const handleSelect = vi.fn()
    render(<EventoCard evento={mockEvento} onSeleccionar={handleSelect} />)

    const row = screen.getByTestId('evento-card')
    fireEvent.click(row)

    expect(handleSelect).toHaveBeenCalledWith(mockEvento)
  })

  it('renders gracefully when evento has no reserva', () => {
    const eventoSinReserva = { ...mockEvento, reserva: null }
    render(<EventoCard evento={eventoSinReserva} onSeleccionar={vi.fn()} />)

    expect(screen.getByTestId('evento-card')).toBeInTheDocument()
    expect(screen.getByTestId('estado-reserva-badge')).toHaveTextContent(
      'Sin reserva'
    )
  })

  it('shows inconsistency warning when evento is en_curso and reserva is expirada', () => {
    const eventoInconsistente = {
      ...mockEvento,
      estado: 'en_curso',
      reserva: { estado: 'expirada', montoTotal: 0 },
    }
    render(<EventoCard evento={eventoInconsistente} onSeleccionar={vi.fn()} />)

    expect(screen.getByTestId('inconsistencia-warning')).toBeInTheDocument()
  })
})
