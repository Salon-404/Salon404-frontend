import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CountdownReserva from './CountdownReserva'

describe('CountdownReserva', () => {
  it('formatea segundos a MM:SS', () => {
    render(<CountdownReserva segundosRestantes={125} />)
    expect(screen.getByTestId('countdown-tiempo').textContent).toBe('02:05')
  })

  it('muestra 00:00 cuando los segundos son 0', () => {
    render(<CountdownReserva segundosRestantes={0} />)
    expect(screen.getByTestId('countdown-tiempo').textContent).toBe('00:00')
  })

  it('muestra 10:00 cuando segundosRestantes es 600 (caso total)', () => {
    render(<CountdownReserva segundosRestantes={600} />)
    expect(screen.getByTestId('countdown-tiempo').textContent).toBe('10:00')
  })

  it('muestra color neutral (slate) cuando segundos > 300', () => {
    render(<CountdownReserva segundosRestantes={450} />)
    const tiempo = screen.getByTestId('countdown-tiempo')
    expect(tiempo.className).toContain('text-slate-700')
    expect(tiempo.className).not.toContain('text-yellow-600')
    expect(tiempo.className).not.toContain('text-red-600')
  })

  it('muestra color amarillo cuando segundos entre 120 y 300', () => {
    render(<CountdownReserva segundosRestantes={200} />)
    const tiempo = screen.getByTestId('countdown-tiempo')
    expect(tiempo.className).toContain('text-yellow-600')
  })

  it('muestra color rojo y negrita cuando segundos < 120', () => {
    render(<CountdownReserva segundosRestantes={60} />)
    const tiempo = screen.getByTestId('countdown-tiempo')
    expect(tiempo.className).toContain('text-red-600')
    expect(tiempo.className).toContain('font-bold')
  })

  it('incluye texto para screen reader con tiempo humano', () => {
    const { container } = render(<CountdownReserva segundosRestantes={125} />)
    const srOnly = container.querySelector('.sr-only')
    expect(srOnly).toBeTruthy()
    expect(srOnly.textContent).toContain('Quedan')
    expect(srOnly.textContent).toContain('2 minutos')
  })

  it('la barra de progreso refleja el porcentaje de tiempo restante', () => {
    const { rerender } = render(
      <CountdownReserva segundosRestantes={300} totalSegundos={600} />
    )
    const barra = screen.getByTestId('countdown-progreso')
    expect(barra.style.width).toBe('50%')

    rerender(<CountdownReserva segundosRestantes={150} totalSegundos={600} />)
    const barra2 = screen.getByTestId('countdown-progreso')
    expect(barra2.style.width).toBe('25%')

    rerender(<CountdownReserva segundosRestantes={600} totalSegundos={600} />)
    const barra3 = screen.getByTestId('countdown-progreso')
    expect(barra3.style.width).toBe('100%')

    rerender(<CountdownReserva segundosRestantes={0} totalSegundos={600} />)
    const barra4 = screen.getByTestId('countdown-progreso')
    expect(barra4.style.width).toBe('0%')
  })
})
