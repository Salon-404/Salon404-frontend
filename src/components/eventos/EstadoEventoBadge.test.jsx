import { describe, it, expect } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import EstadoEventoBadge from './EstadoEventoBadge'
import { ESTADOS_EVENTO } from '../../constants/eventos'

describe('EstadoEventoBadge', () => {
  it('renders each known estado with correct label and badge classes', () => {
    ESTADOS_EVENTO.forEach(({ value, label, badge }) => {
      cleanup()
      render(<EstadoEventoBadge estado={value} />)

      const badgeElement = screen.getByTestId('estado-evento-badge')
      expect(badgeElement).toHaveTextContent(label)
      expect(badgeElement.className).toContain(badge)
    })
  })

  it('renders raw value for unknown estado', () => {
    render(<EstadoEventoBadge estado="desconocido" />)

    expect(screen.getByTestId('estado-evento-badge')).toHaveTextContent(
      'desconocido'
    )
  })
})
