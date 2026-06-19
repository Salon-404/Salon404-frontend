import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SelectorHorarios from './SelectorHorarios'

describe('SelectorHorarios', () => {
  it('muestra estado de carga cuando loading=true', () => {
    render(<SelectorHorarios loading={true} />)
    expect(screen.getByTestId('selector-horarios-loading')).toBeInTheDocument()
    const skeletons = screen.getAllByTestId('horario-skeleton')
    expect(skeletons).toHaveLength(3)
  })

  it('muestra mensaje de error cuando hay error', () => {
    render(<SelectorHorarios error="No se pudo cargar" />)
    expect(screen.getByTestId('selector-horarios-error')).toBeInTheDocument()
    expect(screen.getByTestId('selector-horarios-error').textContent).toBe('No se pudo cargar')
  })

  it('muestra mensaje vacío cuando no hay horarios', () => {
    render(<SelectorHorarios horarios={[]} />)
    expect(screen.getByTestId('selector-horarios-vacio')).toBeInTheDocument()
    expect(screen.getByTestId('selector-horarios-vacio').textContent).toContain('No hay horarios disponibles')
  })

  it('renderiza una card por cada horario', () => {
    const horarios = [
      { inicio: '10:00', fin: '14:00' },
      { inicio: '14:30', fin: '18:30' },
    ]
    render(<SelectorHorarios horarios={horarios} />)
    const lista = screen.getByTestId('selector-horarios')
    expect(lista.querySelectorAll('button')).toHaveLength(2)
  })

  it('cada card muestra el rango horario', () => {
    const horarios = [{ inicio: '10:00', fin: '14:00' }]
    render(<SelectorHorarios horarios={horarios} />)
    expect(screen.getByText('10:00 - 14:00')).toBeInTheDocument()
  })

  it('click en una card llama a onSeleccionarHorario con {inicio, fin}', () => {
    const onSeleccionarHorario = vi.fn()
    const horarios = [
      { inicio: '10:00', fin: '14:00' },
      { inicio: '14:30', fin: '18:30' },
    ]
    render(
      <SelectorHorarios
        horarios={horarios}
        onSeleccionarHorario={onSeleccionarHorario}
      />
    )
    fireEvent.click(screen.getByText('14:30 - 18:30'))
    expect(onSeleccionarHorario).toHaveBeenCalledWith({ inicio: '14:30', fin: '18:30' })
  })

  it('aplica estilo seleccionado a horarioSeleccionado', () => {
    const horario = { inicio: '10:00', fin: '14:00' }
    render(
      <SelectorHorarios
        horarios={[horario, { inicio: '15:00', fin: '19:00' }]}
        horarioSeleccionado={horario}
      />
    )
    const cardSeleccionada = screen.getByText('10:00 - 14:00').closest('button')
    expect(cardSeleccionada.className).toContain('border-indigo-500')
    expect(cardSeleccionada.className).toContain('bg-indigo-50')
    expect(cardSeleccionada.getAttribute('aria-pressed')).toBe('true')

    const cardNoSeleccionada = screen.getByText('15:00 - 19:00').closest('button')
    expect(cardNoSeleccionada.className).not.toContain('border-indigo-500')
  })

  it('muestra texto de duración correcto: "4 horas" para múltiplos de hora', () => {
    const horarios = [
      { inicio: '10:00', fin: '14:00' },
      { inicio: '09:00', fin: '13:00' },
    ]
    render(<SelectorHorarios horarios={horarios} />)
    const textos = screen.getAllByText(/\(4 horas\)/)
    expect(textos.length).toBe(2)
  })

  it('muestra texto de duración correcto: "4 horas 30 minutos" para duraciones con minutos', () => {
    const horarios = [{ inicio: '10:00', fin: '14:30' }]
    render(<SelectorHorarios horarios={horarios} />)
    expect(screen.getByText(/\(4 horas 30 minutos\)/)).toBeInTheDocument()
  })
})
