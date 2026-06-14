import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FormularioReserva from './FormularioReserva'

const tiposEvento = [
  { id: 1, nombre: 'XV', duracionMaximaMinutos: 360 },
  { id: 2, nombre: 'Casamiento', duracionMaximaMinutos: 480 },
  { id: 3, nombre: 'Cumpleaños', duracionMaximaMinutos: 240 },
]

const datosBase = { nombreEvento: '', cantidadInvitados: '', notas: '' }

describe('FormularioReserva', () => {
  it('renderiza el paso 1 por defecto', () => {
    render(
      <FormularioReserva
        tiposEvento={tiposEvento}
        tipoEventoSeleccionado={null}
        onSeleccionarTipo={vi.fn()}
        datosReserva={datosBase}
        onCambiarDatos={vi.fn()}
        onConfirmar={vi.fn()}
      />
    )
    expect(screen.getByTestId('paso-datos')).toBeInTheDocument()
    expect(screen.queryByTestId('paso-resumen')).not.toBeInTheDocument()
  })

  it('muestra el dropdown de tipo de evento', () => {
    render(
      <FormularioReserva
        tiposEvento={tiposEvento}
        tipoEventoSeleccionado={null}
        onSeleccionarTipo={vi.fn()}
        datosReserva={datosBase}
        onCambiarDatos={vi.fn()}
        onConfirmar={vi.fn()}
      />
    )
    const select = screen.getByTestId('input-tipo-evento')
    expect(select).toBeInTheDocument()
    expect(select.querySelectorAll('option')).toHaveLength(4)
  })

  it('muestra los inputs de nombre, invitados y notas', () => {
    render(
      <FormularioReserva
        tiposEvento={tiposEvento}
        tipoEventoSeleccionado={null}
        onSeleccionarTipo={vi.fn()}
        datosReserva={datosBase}
        onCambiarDatos={vi.fn()}
        onConfirmar={vi.fn()}
      />
    )
    expect(screen.getByTestId('input-nombre')).toBeInTheDocument()
    expect(screen.getByTestId('input-invitados')).toBeInTheDocument()
    expect(screen.getByTestId('input-notas')).toBeInTheDocument()
  })

  it('muestra el contador de caracteres para nombre y notas', () => {
    render(
      <FormularioReserva
        tiposEvento={tiposEvento}
        tipoEventoSeleccionado={null}
        onSeleccionarTipo={vi.fn()}
        datosReserva={{ nombreEvento: 'Mi evento', notas: 'Hola' }}
        onCambiarDatos={vi.fn()}
        onConfirmar={vi.fn()}
      />
    )
    expect(screen.getByTestId('char-count-nombre').textContent).toContain('9/100')
    expect(screen.getByTestId('char-count-notas').textContent).toContain('4/500')
  })

  it('el botón "Siguiente" está deshabilitado cuando los campos requeridos están vacíos', () => {
    render(
      <FormularioReserva
        tiposEvento={tiposEvento}
        tipoEventoSeleccionado={null}
        onSeleccionarTipo={vi.fn()}
        datosReserva={datosBase}
        onCambiarDatos={vi.fn()}
        onConfirmar={vi.fn()}
      />
    )
    expect(screen.getByTestId('btn-siguiente')).toBeDisabled()
  })

  it('avanza al paso 2 al hacer click en "Siguiente" con datos válidos', () => {
    const onSeleccionarTipo = vi.fn()
    render(
      <FormularioReserva
        tiposEvento={tiposEvento}
        tipoEventoSeleccionado={1}
        onSeleccionarTipo={onSeleccionarTipo}
        datosReserva={{ nombreEvento: 'Cumple de Juan', cantidadInvitados: 80, notas: '' }}
        onCambiarDatos={vi.fn()}
        onConfirmar={vi.fn()}
      />
    )
    expect(screen.getByTestId('btn-siguiente')).not.toBeDisabled()
    fireEvent.click(screen.getByTestId('btn-siguiente'))
    expect(screen.getByTestId('paso-resumen')).toBeInTheDocument()
  })

  it('el paso 2 muestra el resumen de los datos ingresados', () => {
    render(
      <FormularioReserva
        tiposEvento={tiposEvento}
        tipoEventoSeleccionado={1}
        onSeleccionarTipo={vi.fn()}
        datosReserva={{ nombreEvento: 'Cumple de Juan', cantidadInvitados: 80, notas: 'Decoración rosa' }}
        onCambiarDatos={vi.fn()}
        onConfirmar={vi.fn()}
      />
    )
    fireEvent.click(screen.getByTestId('btn-siguiente'))
    expect(screen.getByTestId('paso-resumen').textContent).toContain('XV')
    expect(screen.getByTestId('paso-resumen').textContent).toContain('Cumple de Juan')
    expect(screen.getByTestId('paso-resumen').textContent).toContain('80')
    expect(screen.getByTestId('paso-resumen').textContent).toContain('Decoración rosa')
  })

  it('el botón "Atrás" vuelve al paso 1', () => {
    render(
      <FormularioReserva
        tiposEvento={tiposEvento}
        tipoEventoSeleccionado={1}
        onSeleccionarTipo={vi.fn()}
        datosReserva={{ nombreEvento: 'Cumple', cantidadInvitados: 50, notas: '' }}
        onCambiarDatos={vi.fn()}
        onConfirmar={vi.fn()}
      />
    )
    fireEvent.click(screen.getByTestId('btn-siguiente'))
    expect(screen.getByTestId('paso-resumen')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('btn-atras'))
    expect(screen.getByTestId('paso-datos')).toBeInTheDocument()
  })

  it('click en "Confirmar reserva" llama a onConfirmar con los datos', () => {
    const onConfirmar = vi.fn()
    render(
      <FormularioReserva
        tiposEvento={tiposEvento}
        tipoEventoSeleccionado={2}
        onSeleccionarTipo={vi.fn()}
        datosReserva={{ nombreEvento: 'Boda', cantidadInvitados: 150, notas: '' }}
        onCambiarDatos={vi.fn()}
        onConfirmar={onConfirmar}
      />
    )
    fireEvent.click(screen.getByTestId('btn-siguiente'))
    fireEvent.click(screen.getByTestId('btn-confirmar'))
    expect(onConfirmar).toHaveBeenCalledWith({
      tipoEventoId: 2,
      nombreEvento: 'Boda',
      cantidadInvitados: 150,
      notas: '',
    })
  })

  it('rechaza cantidad de invitados mayor a 500 (botón Siguiente deshabilitado)', () => {
    render(
      <FormularioReserva
        tiposEvento={tiposEvento}
        tipoEventoSeleccionado={1}
        onSeleccionarTipo={vi.fn()}
        datosReserva={{ nombreEvento: 'Mega evento', cantidadInvitados: 600, notas: '' }}
        onCambiarDatos={vi.fn()}
        onConfirmar={vi.fn()}
      />
    )
    expect(screen.getByTestId('btn-siguiente')).toBeDisabled()
  })

  it('rechaza cantidad de invitados negativa (botón Siguiente deshabilitado)', () => {
    render(
      <FormularioReserva
        tiposEvento={tiposEvento}
        tipoEventoSeleccionado={1}
        onSeleccionarTipo={vi.fn()}
        datosReserva={{ nombreEvento: 'Test', cantidadInvitados: -5, notas: '' }}
        onCambiarDatos={vi.fn()}
        onConfirmar={vi.fn()}
      />
    )
    expect(screen.getByTestId('btn-siguiente')).toBeDisabled()
  })

  it('después de confirmar muestra el mensaje de confirmación', () => {
    render(
      <FormularioReserva
        tiposEvento={tiposEvento}
        tipoEventoSeleccionado={1}
        onSeleccionarTipo={vi.fn()}
        datosReserva={{ nombreEvento: 'OK', cantidadInvitados: 50, notas: '' }}
        onCambiarDatos={vi.fn()}
        onConfirmar={vi.fn()}
      />
    )
    fireEvent.click(screen.getByTestId('btn-siguiente'))
    fireEvent.click(screen.getByTestId('btn-confirmar'))
    expect(screen.getByTestId('formulario-reserva-confirmacion')).toBeInTheDocument()
    expect(screen.getByText(/Reserva confirmada/i)).toBeInTheDocument()
  })
})
