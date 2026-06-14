import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useHorariosDisponibles } from '../../hooks/useHorariosDisponibles'
import { useBloqueoHorario } from '../../hooks/useBloqueoHorario'
import { createEvento } from '../../services/eventosService'
import { calcularMontoTotal } from '../../utils/eventos'
import CalendarioDisponibilidad from '../../components/reservas/CalendarioDisponibilidad'
import SelectorHorarios from '../../components/reservas/SelectorHorarios'
import CountdownReserva from '../../components/reservas/CountdownReserva'
import FormularioReserva from '../../components/reservas/FormularioReserva'

const PASOS = [
  { id: 'fecha', label: 'Fecha' },
  { id: 'tipo', label: 'Tipo' },
  { id: 'horarios', label: 'Horario' },
  { id: 'formulario', label: 'Datos' },
]

const FACTOR_MONTO_POR_INVITADO = 0.01
const DURACION_EXITO_MS = 2000

function calcularExpiracion(segundosRestantes) {
  return new Date(Date.now() + segundosRestantes * 1000).toISOString()
}

function calcularMontoEvento(tipoEvento, cantidadInvitados) {
  if (!tipoEvento) return 0
  const montoBruto = Math.round(
    tipoEvento.precioBase * cantidadInvitados * FACTOR_MONTO_POR_INVITADO
  )
  const extra = Math.max(0, montoBruto - tipoEvento.precioBase)
  return calcularMontoTotal(tipoEvento.precioBase, extra > 0 ? [extra] : [])
}

function construirCliente(user) {
  if (!user) return null
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    telefono: user.telefono || '',
  }
}

function Stepper({ pasoActual }) {
  return (
    <ol className="mb-6 flex items-center justify-between gap-2" aria-label="Pasos del wizard">
      {PASOS.map((p, i) => {
        const activo = i === pasoActual
        const completado = i < pasoActual
        return (
          <li key={p.id} className="flex-1 flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                activo
                  ? 'bg-indigo-600 text-white'
                  : completado
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-200 text-slate-500'
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm ${
                activo ? 'font-medium text-slate-800' : 'text-slate-500'
              }`}
            >
              {p.label}
            </span>
            {i < PASOS.length - 1 && (
              <div
                className={`h-px flex-1 ${
                  completado ? 'bg-indigo-300' : 'bg-slate-200'
                }`}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

/**
 * Wizard unificado para crear un evento con reserva embebida.
 * Flujo: fecha → tipo → horario → formulario.
 * @returns {JSX.Element}
 */
export default function EventoNuevoPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [paso, setPaso] = useState('fecha')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
  const [tipoEventoId, setTipoEventoId] = useState(null)
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null)
  const [datosReserva, setDatosReserva] = useState({
    nombreEvento: '',
    descripcion: '',
    cantidadInvitados: '',
    notas: '',
  })
  const [error, setError] = useState(null)
  const [modalExpirada, setModalExpirada] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)

  const { horarios, loading: loadingHorarios, tiposEvento, refetch } =
    useHorariosDisponibles(fechaSeleccionada, tipoEventoId)
  const { segundosRestantes, bloquear, liberar } = useBloqueoHorario()

  const tipoEvento = useMemo(
    () => tiposEvento.find((t) => t.id === tipoEventoId),
    [tiposEvento, tipoEventoId]
  )

  const pasoActualIndex = PASOS.findIndex((p) => p.id === paso)

  function handleSeleccionarFecha(fecha) {
    setFechaSeleccionada(fecha)
    setError(null)
    setPaso('tipo')
  }

  function handleSeleccionarTipo(id) {
    setTipoEventoId(id)
    setError(null)
  }

  async function handleSeleccionarHorario(horario) {
    setHorarioSeleccionado(horario)
    setError(null)

    const result = await bloquear(
      { fecha: fechaSeleccionada, horaInicio: horario.inicio, horaFin: horario.fin, tipoEventoId },
      () => setModalExpirada(true)
    )

    if (result) {
      setPaso('formulario')
    } else {
      setError('No se pudo bloquear el horario. Probá con otro.')
      setHorarioSeleccionado(null)
    }
  }

  async function handleConfirmarEvento(datosFormulario) {
    if (!user || !tipoEvento || !horarioSeleccionado || !fechaSeleccionada) return

    setEnviando(true)
    setError(null)

    try {
      const cantidadInvitados = Number(datosFormulario.cantidadInvitados)
      const montoTotal = calcularMontoEvento(tipoEvento, cantidadInvitados)
      const expiraEn = calcularExpiracion(segundosRestantes)
      const cliente = construirCliente(user)

      const payload = {
        nombre: datosFormulario.nombreEvento,
        descripcion: datosFormulario.descripcion || '',
        tipoEventoId,
        fecha: fechaSeleccionada,
        horaInicio: horarioSeleccionado.inicio,
        horaFin: horarioSeleccionado.fin,
        eventOwner: user.id,
        cliente,
        reserva: {
          estado: 'pendiente',
          montoTotal,
          expiraEn,
        },
      }

      await createEvento(payload)
      await liberar()
      setExito(true)

      setTimeout(() => {
        navigate('/eventos')
      }, DURACION_EXITO_MS)
    } catch (err) {
      if (err?.response?.status === 409) {
        setError('Ese horario ya no está disponible. Elegí otro.')
        setPaso('horarios')
        setHorarioSeleccionado(null)
        refetch()
      } else {
        setError('Ocurrió un error al crear el evento. Intentá de nuevo.')
      }
    } finally {
      setEnviando(false)
    }
  }

  async function handleAtras() {
    if (paso === 'tipo') {
      setPaso('fecha')
      setTipoEventoId(null)
    } else if (paso === 'horarios') {
      setPaso('tipo')
      setTipoEventoId(null)
    } else if (paso === 'formulario') {
      setPaso('horarios')
      await liberar()
      setHorarioSeleccionado(null)
    }
  }

  function handleReintentarExpirada() {
    setModalExpirada(false)
    setPaso('horarios')
  }

  async function handleCancelarExpirada() {
    setModalExpirada(false)
    await liberar()
    setHorarioSeleccionado(null)
    setPaso('fecha')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-600">
          Debes iniciar sesión para crear un evento.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="evento-nuevo-page">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/eventos')}
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            ← Volver a Eventos
          </button>
          <h1 className="mt-3 text-2xl font-semibold text-slate-800">Nuevo Evento</h1>
        </div>

        <Stepper pasoActual={pasoActualIndex} />

        {error && (
          <div
            className="mb-5 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
            data-testid="evento-nuevo-error"
          >
            {error}
          </div>
        )}

        {exito && (
          <div
            className="mb-5 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700"
            role="alert"
            data-testid="evento-nuevo-exito"
          >
            Evento creado exitosamente
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {paso === 'fecha' && (
            <div>
              <h2 className="text-lg font-medium text-slate-800 mb-4">
                Seleccioná el día del evento
              </h2>
              <CalendarioDisponibilidad
                fechaSeleccionada={fechaSeleccionada}
                onSeleccionarDia={handleSeleccionarFecha}
                reservas={[]}
              />
            </div>
          )}

          {paso === 'tipo' && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-slate-800">
                ¿Qué tipo de evento vas a hacer?
              </h2>
              <select
                value={tipoEventoId ?? ''}
                onChange={(e) => handleSeleccionarTipo(Number(e.target.value) || null)}
                data-testid="select-tipo-evento"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Seleccioná un tipo de evento</option>
                {tiposEvento.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} ({Math.floor(t.duracionMaximaMinutos / 60)}hs)
                  </option>
                ))}
              </select>
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={handleAtras}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setPaso('horarios')}
                  disabled={!tipoEventoId}
                  data-testid="btn-siguiente-tipo"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {paso === 'horarios' && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-slate-800">
                Horarios disponibles
              </h2>
              <SelectorHorarios
                horarios={horarios}
                horarioSeleccionado={horarioSeleccionado}
                onSeleccionarHorario={handleSeleccionarHorario}
                loading={loadingHorarios}
              />
              <div className="flex justify-start pt-2">
                <button
                  type="button"
                  onClick={handleAtras}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Atrás
                </button>
              </div>
            </div>
          )}

          {paso === 'formulario' && (
            <div className="space-y-4">
              <CountdownReserva segundosRestantes={segundosRestantes} />
              <FormularioReserva
                tiposEvento={tiposEvento}
                tipoEventoSeleccionado={tipoEventoId}
                onSeleccionarTipo={setTipoEventoId}
                datosReserva={datosReserva}
                onCambiarDatos={setDatosReserva}
                onConfirmar={handleConfirmarEvento}
                error={error}
                cargando={enviando}
              />
              <div className="flex justify-start pt-2">
                <button
                  type="button"
                  onClick={handleAtras}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Atrás
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalExpirada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-800">Tu reserva expiró</h3>
            <p className="mt-2 text-sm text-slate-600">
              El horario quedó libre nuevamente. ¿Querés intentar de nuevo?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelarExpirada}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReintentarExpirada}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
