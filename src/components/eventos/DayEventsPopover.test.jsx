import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DayEventsPopover from './DayEventsPopover'

const tiposById = {
  2: { id: 2, nombre: 'Casamiento', color: '#ec4899' },
  5: { id: 5, nombre: 'Bautismo', color: '#22c55e' },
}

const eventosJunio14 = [
  {
    id: 'evt-001',
    nombre: 'Bautismo Benjamín López',
    fecha: '2026-06-14',
    horaInicio: '09:00',
    horaFin: '12:00',
    franja: 'manana',
    estado: 'pendiente',
    tipoEventoId: 5,
    cliente: { nombre: 'Carolina López' },
    cantidadInvitados: 45,
<<<<<<< HEAD
    reserva: { estado: 'confirmada' },
=======
>>>>>>> origin/develop
  },
  {
    id: 'evt-002',
    nombre: 'Casamiento Rodríguez-Pérez',
    fecha: '2026-06-14',
    horaInicio: '21:00',
    horaFin: '03:00',
    franja: 'noche',
    estado: 'pendiente',
    tipoEventoId: 2,
    cliente: { nombre: 'Lucía Rodríguez' },
    cantidadInvitados: 180,
  },
]

const anchorRect = {
  top: 200,
  left: 300,
  right: 350,
  bottom: 250,
  width: 50,
  height: 50,
}

const defaultProps = {
  fecha: '2026-06-14',
  eventos: eventosJunio14,
  tiposById,
  anchorRect,
  onClose: vi.fn(),
  onMouseEnter: vi.fn(),
  onMouseLeave: vi.fn(),
  isAdmin: false,
}

describe('DayEventsPopover', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    defaultProps.onClose.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders full event details when isAdmin is true', () => {
    render(<DayEventsPopover {...defaultProps} isAdmin={true} />)

    expect(screen.getByText('Bautismo Benjamín López')).toBeInTheDocument()
    expect(screen.getByText('Casamiento Rodríguez-Pérez')).toBeInTheDocument()
    expect(screen.getByText(/Carolina López/)).toBeInTheDocument()
    expect(screen.getByText(/Lucía Rodríguez/)).toBeInTheDocument()
  })

  it('renders "Horario reservado" without private data when isAdmin is false', () => {
    render(<DayEventsPopover {...defaultProps} isAdmin={false} />)

    const reservedLabels = screen.getAllByText('Horario reservado')
    expect(reservedLabels).toHaveLength(2)

    expect(screen.queryByText('Bautismo Benjamín López')).not.toBeInTheDocument()
    expect(screen.queryByText('Casamiento Rodríguez-Pérez')).not.toBeInTheDocument()
    expect(screen.queryByText('Carolina López')).not.toBeInTheDocument()
    expect(screen.queryByText('Lucía Rodríguez')).not.toBeInTheDocument()
  })

  it('closes on Escape key', () => {
    render(<DayEventsPopover {...defaultProps} />)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on click outside after delay', async () => {
    render(<DayEventsPopover {...defaultProps} />)

    // The component delays mousedown listener by 50ms
    vi.advanceTimersByTime(100)

    fireEvent.mouseDown(document.body)
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('has correct aria attributes: role=dialog and aria-label with date', () => {
    render(<DayEventsPopover {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'false')
    expect(dialog).toHaveAttribute('aria-label')
    // The aria-label should contain the formatted date
    expect(dialog.getAttribute('aria-label')).toContain('14')
    expect(dialog.getAttribute('aria-label')).toContain('junio')
  })

  it('has a close button with aria-label="Cerrar"', () => {
    render(<DayEventsPopover {...defaultProps} />)

    const closeButton = screen.getByLabelText('Cerrar')
    expect(closeButton).toBeInTheDocument()
  })

  it('shows event count badge', () => {
    render(<DayEventsPopover {...defaultProps} />)

    expect(screen.getByText('2 eventos')).toBeInTheDocument()
  })

<<<<<<< HEAD
  it('renders reservation badge when reserva.estado is present', () => {
    render(<DayEventsPopover {...defaultProps} isAdmin={true} />)

    expect(screen.getByTestId('estado-reserva-badge')).toBeInTheDocument()
    expect(screen.getByText('Confirmada')).toBeInTheDocument()
  })

=======
>>>>>>> origin/develop
  it('renders nothing when eventos is empty', () => {
    const { container } = render(
      <DayEventsPopover {...defaultProps} eventos={[]} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when eventos is null', () => {
    const { container } = render(
      <DayEventsPopover {...defaultProps} eventos={null} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('applies no transition classes when prefers-reduced-motion is active', () => {
    // Override matchMedia to return true for prefers-reduced-motion
    const originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(<DayEventsPopover {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    // Should NOT have transition classes
    expect(dialog.className).not.toContain('transition-all')
    expect(dialog.className).not.toContain('duration-200')

    window.matchMedia = originalMatchMedia
  })
})
