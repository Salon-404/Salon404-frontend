import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CalendarioDisponibilidad from './CalendarioDisponibilidad'

describe('CalendarioDisponibilidad', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renderiza el header con el mes y año actuales', () => {
    render(<CalendarioDisponibilidad />)
    expect(screen.getByTestId('calendario-titulo').textContent.toLowerCase()).toContain('junio')
    expect(screen.getByTestId('calendario-titulo').textContent).toContain('2026')
  })

  it('renderiza los 7 headers de días de la semana', () => {
    render(<CalendarioDisponibilidad />)
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(7)
    expect(headers[0].textContent).toBe('Dom')
    expect(headers[6].textContent).toBe('Sáb')
  })

  it('renderiza todos los días del mes', () => {
    render(<CalendarioDisponibilidad mesActual="2026-06" />)
    const boton15 = screen.getByRole('gridcell', { name: /15 de junio/i })
    expect(boton15).toBeInTheDocument()
    const boton30 = screen.getByRole('gridcell', { name: /30 de junio/i })
    expect(boton30).toBeInTheDocument()
  })

  it('renderiza días de meses anteriores y siguientes con opacidad reducida', () => {
    render(<CalendarioDisponibilidad mesActual="2026-06" />)
    const diaPrevio = document.querySelector('[data-fecha="2026-05-31"]')
    expect(diaPrevio).toBeTruthy()
    expect(diaPrevio.className).toContain('opacity-50')
  })

  it('llama a onSeleccionarDia al hacer click en un día disponible', () => {
    const onSeleccionarDia = vi.fn()
    render(
      <CalendarioDisponibilidad
        mesActual="2026-06"
        onSeleccionarDia={onSeleccionarDia}
      />
    )
    const dia = screen.getByRole('gridcell', { name: /15 de junio/i })
    fireEvent.click(dia)
    expect(onSeleccionarDia).toHaveBeenCalledWith('2026-06-15')
  })

  it('NO llama a onSeleccionarDia al hacer click en un día deshabilitado', () => {
    const onSeleccionarDia = vi.fn()
    const reservasOcupadas = [
      {
        fecha: '2026-06-20',
        horaInicio: '00:00',
        horaFin: '23:00',
      },
    ]
    render(
      <CalendarioDisponibilidad
        mesActual="2026-06"
        onSeleccionarDia={onSeleccionarDia}
        reservas={reservasOcupadas}
      />
    )
    const diaCompleto = screen.getByRole('gridcell', { name: /20 de junio, completo/i })
    expect(diaCompleto).toBeDisabled()
    fireEvent.click(diaCompleto)
    expect(onSeleccionarDia).not.toHaveBeenCalled()
  })

  it('aplica estilo de seleccionado a la fechaSeleccionada', () => {
    render(
      <CalendarioDisponibilidad
        mesActual="2026-06"
        fechaSeleccionada="2026-06-15"
      />
    )
    const dia = screen.getByRole('gridcell', { name: /15 de junio/i })
    expect(dia.className).toContain('ring-2')
    expect(dia.className).toContain('ring-indigo-500')
    expect(dia.getAttribute('aria-pressed')).toBe('true')
  })

  it('los botones de mes anterior/siguiente cambian el mes mostrado', () => {
    render(<CalendarioDisponibilidad mesActual="2026-06" />)
    expect(screen.getByTestId('calendario-titulo').textContent.toLowerCase()).toContain('junio')

    fireEvent.click(screen.getByRole('button', { name: /mes siguiente/i }))
    expect(screen.getByTestId('calendario-titulo').textContent.toLowerCase()).toContain('julio')

    fireEvent.click(screen.getByRole('button', { name: /mes anterior/i }))
    fireEvent.click(screen.getByRole('button', { name: /mes anterior/i }))
    expect(screen.getByTestId('calendario-titulo').textContent.toLowerCase()).toContain('mayo')
  })

  it('tiene aria-labels correctos para cada estado', () => {
    const reservas = [
      { fecha: '2026-06-10', horaInicio: '14:00', horaFin: '15:00' },
    ]
    render(
      <CalendarioDisponibilidad
        mesActual="2026-06"
        reservas={reservas}
      />
    )
    expect(screen.getByRole('gridcell', { name: /10 de junio, tiene reservas/i })).toBeInTheDocument()
    expect(screen.getByRole('gridcell', { name: /15 de junio, disponible/i })).toBeInTheDocument()
  })
})
