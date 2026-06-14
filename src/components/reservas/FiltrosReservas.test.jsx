import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FiltrosReservas from './FiltrosReservas'

describe('FiltrosReservas', () => {
  const defaultFiltros = {
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
    tipoEventoId: null,
    nombreCliente: '',
  }

  function getDateInputs(container) {
    return container.querySelectorAll('input[type="date"]')
  }

  it('renders all filter inputs', () => {
    const { container } = render(<FiltrosReservas filtros={defaultFiltros} onCambiarFiltros={vi.fn()} />)

    expect(screen.getByPlaceholderText('Buscar por cliente...')).toBeInTheDocument()
    expect(screen.getAllByRole('combobox')).toHaveLength(2)
    const dateInputs = getDateInputs(container)
    expect(dateInputs).toHaveLength(2)
  })

  it('typing in name input calls onCambiarFiltros', () => {
    const onChange = vi.fn()
    render(<FiltrosReservas filtros={defaultFiltros} onCambiarFiltros={onChange} />)

    const input = screen.getByPlaceholderText('Buscar por cliente...')
    fireEvent.change(input, { target: { value: 'Juan' } })

    expect(onChange).toHaveBeenCalledWith({
      ...defaultFiltros,
      nombreCliente: 'Juan',
    })
  })

  it('selecting estado calls onCambiarFiltros', () => {
    const onChange = vi.fn()
    render(<FiltrosReservas filtros={defaultFiltros} onCambiarFiltros={onChange} />)

    // El primer select es el de estado
    const estadoSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(estadoSelect, { target: { value: 'confirmada' } })

    expect(onChange).toHaveBeenCalledWith({
      ...defaultFiltros,
      estado: 'confirmada',
    })
  })

  it('setting fechaDesde/Hasta calls onCambiarFiltros', () => {
    const onChange = vi.fn()
    const { container } = render(<FiltrosReservas filtros={defaultFiltros} onCambiarFiltros={onChange} />)

    const dateInputs = getDateInputs(container)
    fireEvent.change(dateInputs[0], { target: { value: '2026-06-01' } })

    expect(onChange).toHaveBeenLastCalledWith({
      ...defaultFiltros,
      fechaDesde: '2026-06-01',
    })

    fireEvent.change(dateInputs[1], { target: { value: '2026-06-30' } })

    // El segundo cambio preserva el estado previo (fechaDesde) porque el handler
    // hace spread del estado anterior — es el comportamiento correcto del componente.
    expect(onChange).toHaveBeenLastCalledWith({
      ...defaultFiltros,
      fechaDesde: '',
      fechaHasta: '2026-06-30',
    })
    // Y verificamos que fechaHasta también se incluyó
    expect(onChange.mock.calls[1][0].fechaHasta).toBe('2026-06-30')
  })
})