import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EventoFiltros from './EventoFiltros'

const defaultFiltros = {
  busqueda: '',
  estadoEvento: '',
  estadoReserva: '',
  tipoEventoId: null,
  fechaDesde: '',
  fechaHasta: '',
}

const tiposEvento = [
  { id: 1, nombre: 'XV' },
  { id: 2, nombre: 'Casamiento' },
]

function renderFiltros(props = {}) {
  return render(
    <EventoFiltros
      filtros={defaultFiltros}
      onCambiarFiltros={vi.fn()}
      tiposEvento={tiposEvento}
      {...props}
    />
  )
}

describe('EventoFiltros', () => {
  it('renders all filter inputs', () => {
    renderFiltros()

    expect(screen.getByTestId('filtro-busqueda')).toBeInTheDocument()
    expect(screen.getByTestId('filtro-estado-evento')).toBeInTheDocument()
    expect(screen.getByTestId('filtro-estado-reserva')).toBeInTheDocument()
    expect(screen.getByTestId('filtro-tipo-evento')).toBeInTheDocument()
    expect(screen.getByTestId('filtro-fecha-desde')).toBeInTheDocument()
    expect(screen.getByTestId('filtro-fecha-hasta')).toBeInTheDocument()
  })

  it('typing in search input calls onCambiarFiltros with busqueda', () => {
    const onChange = vi.fn()
    renderFiltros({ onCambiarFiltros: onChange })

    fireEvent.change(screen.getByTestId('filtro-busqueda'), {
      target: { value: 'María' },
    })

    expect(onChange).toHaveBeenCalledWith({
      ...defaultFiltros,
      busqueda: 'María',
    })
  })

  it('selecting estadoEvento calls onCambiarFiltros', () => {
    const onChange = vi.fn()
    renderFiltros({ onCambiarFiltros: onChange })

    fireEvent.change(screen.getByTestId('filtro-estado-evento'), {
      target: { value: 'pendiente' },
    })

    expect(onChange).toHaveBeenCalledWith({
      ...defaultFiltros,
      estadoEvento: 'pendiente',
    })
  })

  it('selecting estadoReserva calls onCambiarFiltros', () => {
    const onChange = vi.fn()
    renderFiltros({ onCambiarFiltros: onChange })

    fireEvent.change(screen.getByTestId('filtro-estado-reserva'), {
      target: { value: 'confirmada' },
    })

    expect(onChange).toHaveBeenCalledWith({
      ...defaultFiltros,
      estadoReserva: 'confirmada',
    })
  })

  it('selecting tipoEventoId calls onCambiarFiltros with number', () => {
    const onChange = vi.fn()
    renderFiltros({ onCambiarFiltros: onChange })

    fireEvent.change(screen.getByTestId('filtro-tipo-evento'), {
      target: { value: '2' },
    })

    expect(onChange).toHaveBeenCalledWith({
      ...defaultFiltros,
      tipoEventoId: 2,
    })
  })

  it('setting fechaDesde/Hasta calls onCambiarFiltros', () => {
    const onChange = vi.fn()
    renderFiltros({ onCambiarFiltros: onChange })

    fireEvent.change(screen.getByTestId('filtro-fecha-desde'), {
      target: { value: '2026-06-01' },
    })

    expect(onChange).toHaveBeenCalledWith({
      ...defaultFiltros,
      fechaDesde: '2026-06-01',
    })

    fireEvent.change(screen.getByTestId('filtro-fecha-hasta'), {
      target: { value: '2026-06-30' },
    })

    expect(onChange).toHaveBeenLastCalledWith({
      ...defaultFiltros,
      fechaHasta: '2026-06-30',
    })
  })
})
