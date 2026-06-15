import { useState } from 'react'

const MAX_NOMBRE = 100
const MAX_INVITADOS = 500
const MAX_NOTAS = 500
const PASOS = ['Datos', 'Resumen', 'Confirmación']
const PASO_DATOS = 0
const PASO_RESUMEN = 1
const PASO_CONFIRMACION = 2

const INPUT_CLASS =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
const LABEL_CLASS = 'block text-sm font-medium text-slate-700 mb-1'
const CHAR_COUNT_CLASS = 'mt-1 text-xs text-slate-500 text-right'
const ERROR_TEXT_CLASS = 'mt-1 text-xs text-red-600'
const BTN_PRIMARY = 'rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
const BTN_SECONDARY = 'rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors'

function datosValidados(datos, tipoEventoId) {
  const errores = {}
  if (!tipoEventoId) errores.tipoEventoId = 'Seleccioná un tipo de evento'
  if (!datos.nombreEvento || !datos.nombreEvento.trim()) {
    errores.nombreEvento = 'El nombre del evento es obligatorio'
  } else if (datos.nombreEvento.length > MAX_NOMBRE) {
    errores.nombreEvento = `Máximo ${MAX_NOMBRE} caracteres`
  }
  if (datos.cantidadInvitados === '' || datos.cantidadInvitados == null) {
    errores.cantidadInvitados = 'La cantidad de invitados es obligatoria'
  } else if (Number(datos.cantidadInvitados) < 1) {
    errores.cantidadInvitados = 'Debe ser un número positivo'
  } else if (Number(datos.cantidadInvitados) > MAX_INVITADOS) {
    errores.cantidadInvitados = `Máximo ${MAX_INVITADOS} invitados`
  }
  if (datos.notas && datos.notas.length > MAX_NOTAS) {
    errores.notas = `Máximo ${MAX_NOTAS} caracteres`
  }
  return errores
}

function Stepper({ pasoActual }) {
  return (
    <ol className="flex items-center justify-between mb-6" aria-label="Pasos del formulario">
      {PASOS.map((label, idx) => {
        const activo = idx === pasoActual
        const completado = idx < pasoActual
        const dotClases = [
          'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold',
          completado
            ? 'bg-indigo-600 text-white'
            : activo
              ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
              : 'bg-slate-100 text-slate-500',
        ].join(' ')
        return (
          <li key={label} className="flex-1 flex items-center">
            <span className={dotClases} aria-current={activo ? 'step' : undefined}>
              {idx + 1}
            </span>
            <span className={`ml-2 text-sm ${activo ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
              {label}
            </span>
            {idx < PASOS.length - 1 && (
              <span className="flex-1 h-px bg-slate-200 mx-2" aria-hidden="true" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function ResumenBloque({ titulo, valor }) {
  return (
    <div className="border-b border-slate-100 py-2 last:border-b-0">
      <div className="text-xs uppercase tracking-wide text-slate-500">{titulo}</div>
      <div className="text-sm text-slate-800 mt-1 break-words">{valor || '—'}</div>
    </div>
  )
}

function getTipoLabel(tiposEvento, id) {
  const tipo = tiposEvento.find((t) => t.id === id)
  return tipo ? tipo.nombre : `Tipo ${id}`
}

/**
 * Wizard de 3 pasos para crear una reserva
 * @param {Object} props
 * @param {Array} props.tiposEvento - Tipos de evento disponibles
 * @param {number|null} props.tipoEventoSeleccionado - ID del tipo de evento seleccionado
 * @param {Function} props.onSeleccionarTipo - Callback al cambiar tipo de evento
 * @param {{nombreEvento: string, cantidadInvitados: number|string, notas: string}} props.datosReserva
 * @param {Function} props.onCambiarDatos - Callback al modificar datos del formulario
 * @param {Function} props.onConfirmar - Callback al confirmar la reserva
 * @param {string|null} [props.error] - Mensaje de error global
 * @param {boolean} [props.cargando] - Estado de carga al enviar
 * @returns {JSX.Element}
 */
export default function FormularioReserva({
  tiposEvento = [],
  tipoEventoSeleccionado = null,
  onSeleccionarTipo,
  datosReserva = { nombreEvento: '', cantidadInvitados: '', notas: '' },
  onCambiarDatos,
  onConfirmar,
  error = null,
  cargando = false,
}) {
  const [paso, setPaso] = useState(PASO_DATOS)
  const [errores, setErrores] = useState({})

  const erroresActuales = datosValidados(datosReserva, tipoEventoSeleccionado)
  const puedeAvanzar = Object.keys(erroresActuales).length === 0

  function handleSiguiente() {
    const nuevosErrores = datosValidados(datosReserva, tipoEventoSeleccionado)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return
    setPaso(PASO_RESUMEN)
  }

  function handleAtras() {
    setErrores({})
    setPaso(PASO_DATOS)
  }

  function handleConfirmar() {
    if (!onConfirmar) return
    onConfirmar({
      tipoEventoId: tipoEventoSeleccionado,
      ...datosReserva,
    })
    setPaso(PASO_CONFIRMACION)
  }

  if (paso === PASO_CONFIRMACION) {
    return (
      <div
        className="bg-white rounded-lg shadow p-6"
        data-testid="formulario-reserva-confirmacion"
      >
        <div className="text-center">
          <div className="text-5xl mb-3" aria-hidden="true">✅</div>
          <h2 className="text-xl font-semibold text-slate-800">Reserva confirmada</h2>
          <p className="mt-2 text-sm text-slate-600">
            Tu reserva fue registrada con éxito. Te enviamos los detalles por email.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6" data-testid="formulario-reserva">
      <Stepper pasoActual={paso} />

      {error && (
        <div
          className="mb-4 border border-red-300 bg-red-50 text-red-700 rounded-md p-3 text-sm"
          role="alert"
          data-testid="formulario-reserva-error"
        >
          {error}
        </div>
      )}

      {paso === PASO_DATOS && (
        <div className="space-y-4" data-testid="paso-datos">
          <div>
            <label htmlFor="tipo-evento" className={LABEL_CLASS}>
              Tipo de evento <span className="text-red-600">*</span>
            </label>
            <select
              id="tipo-evento"
              data-testid="input-tipo-evento"
              className={INPUT_CLASS}
              value={tipoEventoSeleccionado ?? ''}
              onChange={(e) => {
                const valor = e.target.value ? Number(e.target.value) : null
                if (onSeleccionarTipo) onSeleccionarTipo(valor)
              }}
            >
              <option value="">Seleccioná un tipo</option>
              {tiposEvento.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
            {errores.tipoEventoId && <p className={ERROR_TEXT_CLASS}>{errores.tipoEventoId}</p>}
          </div>

          <div>
            <label htmlFor="nombre-evento" className={LABEL_CLASS}>
              Nombre del evento <span className="text-red-600">*</span>
            </label>
            <input
              id="nombre-evento"
              data-testid="input-nombre"
              type="text"
              maxLength={MAX_NOMBRE}
              className={INPUT_CLASS}
              value={datosReserva.nombreEvento || ''}
              onChange={(e) => onCambiarDatos && onCambiarDatos({ ...datosReserva, nombreEvento: e.target.value })}
            />
            <p className={CHAR_COUNT_CLASS} data-testid="char-count-nombre">
              {(datosReserva.nombreEvento || '').length}/{MAX_NOMBRE}
            </p>
            {errores.nombreEvento && <p className={ERROR_TEXT_CLASS}>{errores.nombreEvento}</p>}
          </div>

          <div>
            <label htmlFor="cantidad-invitados" className={LABEL_CLASS}>
              Cantidad de invitados <span className="text-red-600">*</span>
            </label>
            <input
              id="cantidad-invitados"
              data-testid="input-invitados"
              type="number"
              min="1"
              max={MAX_INVITADOS}
              className={INPUT_CLASS}
              value={datosReserva.cantidadInvitados ?? ''}
              onChange={(e) => onCambiarDatos && onCambiarDatos({ ...datosReserva, cantidadInvitados: e.target.value })}
            />
            {errores.cantidadInvitados && <p className={ERROR_TEXT_CLASS}>{errores.cantidadInvitados}</p>}
          </div>

          <div>
            <label htmlFor="notas" className={LABEL_CLASS}>
              Notas adicionales
            </label>
            <textarea
              id="notas"
              data-testid="input-notas"
              rows={3}
              maxLength={MAX_NOTAS}
              className={`${INPUT_CLASS} resize-none`}
              value={datosReserva.notas || ''}
              onChange={(e) => onCambiarDatos && onCambiarDatos({ ...datosReserva, notas: e.target.value })}
            />
            <p className={CHAR_COUNT_CLASS} data-testid="char-count-notas">
              {(datosReserva.notas || '').length}/{MAX_NOTAS}
            </p>
            {errores.notas && <p className={ERROR_TEXT_CLASS}>{errores.notas}</p>}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              data-testid="btn-siguiente"
              onClick={handleSiguiente}
              disabled={!puedeAvanzar}
              className={BTN_PRIMARY}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {paso === PASO_RESUMEN && (
        <div className="space-y-4" data-testid="paso-resumen">
          <ResumenBloque titulo="Tipo de evento" valor={getTipoLabel(tiposEvento, tipoEventoSeleccionado)} />
          <ResumenBloque titulo="Nombre del evento" valor={datosReserva.nombreEvento} />
          <ResumenBloque titulo="Cantidad de invitados" valor={String(datosReserva.cantidadInvitados || '')} />
          <ResumenBloque titulo="Notas" valor={datosReserva.notas} />

          <div className="flex justify-between pt-4">
            <button
              type="button"
              data-testid="btn-atras"
              onClick={handleAtras}
              className={BTN_SECONDARY}
            >
              Atrás
            </button>
            <button
              type="button"
              data-testid="btn-confirmar"
              onClick={handleConfirmar}
              disabled={cargando}
              className={BTN_PRIMARY}
            >
              {cargando ? 'Confirmando…' : 'Confirmar reserva'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
