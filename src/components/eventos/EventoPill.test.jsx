import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EventoPill from './EventoPill'

const tipoCasamiento = { id: 2, nombre: 'Casamiento', color: '#ec4899' }

const eventoBase = {
  id: 'evt-001',
  nombre: 'Casamiento Rodríguez-Pérez',
  horaInicio: '21:00',
  horaFin: '03:00',
  franja: 'noche',
  estado: 'pendiente',
}

describe('EventoPill', () => {
  it('renders event name and time when isAdmin is true', () => {
    render(<EventoPill evento={eventoBase} tipo={tipoCasamiento} isAdmin={true} />)

    expect(screen.getByText('21:00')).toBeInTheDocument()
    expect(screen.getByText('Casamiento Rodríguez-Pérez')).toBeInTheDocument()
  })

  it('renders "Horario reservado" and time when isAdmin is false', () => {
    render(<EventoPill evento={eventoBase} tipo={tipoCasamiento} isAdmin={false} />)

    expect(screen.getByText('21:00')).toBeInTheDocument()
    expect(screen.getByText('Horario reservado')).toBeInTheDocument()
    expect(screen.queryByText('Casamiento Rodríguez-Pérez')).not.toBeInTheDocument()
  })

  it('shows line-through style for cancelled events', () => {
    const eventoCancelado = { ...eventoBase, estado: 'cancelado' }
    const { container } = render(
      <EventoPill evento={eventoCancelado} tipo={tipoCasamiento} isAdmin={true} />
    )

    const nameSpan = container.querySelector('.line-through')
    expect(nameSpan).toBeInTheDocument()
    expect(nameSpan.textContent).toBe('Casamiento Rodríguez-Pérez')
  })

  it('renders nothing when tipo is null', () => {
    const { container } = render(
      <EventoPill evento={eventoBase} tipo={null} isAdmin={true} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when tipo is undefined', () => {
    const { container } = render(
      <EventoPill evento={eventoBase} tipo={undefined} isAdmin={false} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('sets title attribute with time and display name', () => {
    const { container } = render(
      <EventoPill evento={eventoBase} tipo={tipoCasamiento} isAdmin={true} />
    )

    const pill = container.firstChild
    expect(pill).toHaveAttribute('title', '21:00 Casamiento Rodríguez-Pérez')
  })

  it('sets title with "Horario reservado" for non-admin', () => {
    const { container } = render(
      <EventoPill evento={eventoBase} tipo={tipoCasamiento} isAdmin={false} />
    )

    const pill = container.firstChild
    expect(pill).toHaveAttribute('title', '21:00 Horario reservado')
  })
})
