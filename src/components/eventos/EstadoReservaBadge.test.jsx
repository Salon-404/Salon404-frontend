import { describe, it, expect } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import EstadoReservaBadge from './EstadoReservaBadge'
import { ESTADOS_RESERVA } from '../../constants/eventos'

describe('EstadoReservaBadge', () => {
  it('renders each known estado with correct label and badge classes', () => {
    ESTADOS_RESERVA.forEach(({ value, label, badge }) => {
      cleanup()
      render(<EstadoReservaBadge estado={value} />)

      const badgeElement = screen.getByTestId('estado-reserva-badge')
      expect(badgeElement).toHaveTextContent(label)
      expect(badgeElement.className).toContain(badge)
    })
  })

  it('renders raw value for unknown estado', () => {
    render(<EstadoReservaBadge estado="desconocido" />)

    expect(screen.getByTestId('estado-reserva-badge')).toHaveTextContent(
      'desconocido'
    )
  })

  it('renders fallback "Sin reserva" when estado is null or undefined', () => {
    const { rerender } = render(<EstadoReservaBadge estado={null} />)
    expect(screen.getByTestId('estado-reserva-badge')).toHaveTextContent(
      'Sin reserva'
    )

    rerender(<EstadoReservaBadge estado={undefined} />)
    expect(screen.getByTestId('estado-reserva-badge')).toHaveTextContent(
      'Sin reserva'
    )
  })
})
