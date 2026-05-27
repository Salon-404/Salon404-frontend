import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import StatusBadge from '../../components/reservas/StatusBadge'
import { getReserva, updateEstado } from '../../services/reservasService'
import { getPlano } from '../../services/mesasService'
import { TIPOS_EVENTO, HORARIOS } from '../../constants/reservas'

const IS_ADMIN = true // reemplazar con lectura del JWT cuando esté Auth

function getLabelFromValue(list, value) {
  return list.find((item) => item.value === value)?.label ?? value
}

export default function ReservaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [reserva, setReserva] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [accionando, setAccionando] = useState(false)
  const [modalCancelar, setModalCancelar] = useState(false)
  const [resumenMesas, setResumenMesas] = useState(null)

  useEffect(() => {
    getReserva(id)
      .then(setReserva)
      .catch((err) => {
        if (err?.response?.status === 404) {
          setError('Reserva no encontrada.')
        } else {
          setError('Error al cargar la reserva.')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    getPlano(id)
      .then(plano => {
        const totalAsignados = plano.ocupacion.reduce((acc, o) => acc + o.asignados, 0)
        const mesasEnUso = plano.ocupacion.filter(o => o.asignados > 0).length
        setResumenMesas({ totalAsignados, mesasEnUso, totalInvitados: plano.totalInvitados })
      })
      .catch(() => {})
  }, [id])

  async function handleConfirmar() {
    setAccionando(true)
    try {
      const actualizada = await updateEstado(id, 'confirmada')
      setReserva(actualizada)
    } catch {
      alert('No se pudo confirmar la reserva.')
    } finally {
      setAccionando(false)
    }
  }

  async function handleCancelar() {
    setAccionando(true)
    setModalCancelar(false)
    try {
      const actualizada = await updateEstado(id, 'cancelada')
      setReserva(actualizada)
    } catch {
      alert('No se pudo cancelar la reserva.')
    } finally {
      setAccionando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Cargando reserva…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error}</p>
        <Link to="/reservas" className="text-indigo-600 hover:underline text-sm">
          ← Volver a reservas
        </Link>
      </div>
    )
  }

  const fechaFormateada = format(new Date(reserva.fecha + 'T12:00:00'), "d 'de' MMMM yyyy", { locale: es })

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/reservas"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm"
          >
            ← Volver
          </Link>
          <StatusBadge estado={reserva.estado} />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Reserva #{reserva.id} — {reserva.nombreCliente}
        </h1>

        {/* Datos del evento */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100 mb-6">
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            <div className="p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Fecha</p>
              <p className="text-slate-800 font-medium">{fechaFormateada}</p>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Tipo de evento</p>
              <p className="text-slate-800 font-medium">
                {getLabelFromValue(TIPOS_EVENTO, reserva.tipoEvento)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            <div className="p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Horario</p>
              <p className="text-slate-800 font-medium">
                {getLabelFromValue(HORARIOS, reserva.horario)}
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Invitados aprox.</p>
              <p className="text-slate-800 font-medium">~{reserva.cantidadInvitados}</p>
            </div>
          </div>
        </div>

        {/* Datos de contacto */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Contacto del cliente
          </h2>
          <dl className="space-y-2">
            <div className="flex gap-2">
              <dt className="w-20 text-slate-400 text-sm shrink-0">Nombre</dt>
              <dd className="text-slate-800 text-sm font-medium">{reserva.nombreCliente}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 text-slate-400 text-sm shrink-0">Email</dt>
              <dd className="text-slate-800 text-sm">
                <a href={`mailto:${reserva.email}`} className="text-indigo-600 hover:underline">
                  {reserva.email}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 text-slate-400 text-sm shrink-0">Teléfono</dt>
              <dd className="text-slate-800 text-sm">{reserva.telefono}</dd>
            </div>
          </dl>
        </div>

        {/* Notas */}
        {reserva.notas && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Notas
            </h2>
            <p className="text-slate-700 text-sm whitespace-pre-line">{reserva.notas}</p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => navigate(`/reservas/${id}/editar`)}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            Editar
          </button>

          {/* Acceso rápido al módulo de mesas para esta reserva */}
          {IS_ADMIN && (
            <div className="flex items-center gap-2">
              <Link
                to={`/mesas/asignar/${id}`}
                className="px-4 py-2 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 text-sm font-medium hover:bg-indigo-100 transition-colors"
              >
                Asignar mesas
              </Link>
              {resumenMesas && (
                <span className={`text-xs font-medium ${resumenMesas.totalAsignados > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {resumenMesas.totalAsignados > 0
                    ? `${resumenMesas.totalAsignados}/${resumenMesas.totalInvitados} invitados · ${resumenMesas.mesasEnUso} ${resumenMesas.mesasEnUso === 1 ? 'mesa' : 'mesas'}`
                    : 'Sin invitados asignados'}
                </span>
              )}
            </div>
          )}
          <Link
            to={`/mesas?reserva=${id}`}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Ver plano
          </Link>

          {IS_ADMIN && reserva.estado !== 'confirmada' && reserva.estado !== 'cancelada' && (
            <button
              onClick={handleConfirmar}
              disabled={accionando}
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {accionando ? 'Guardando…' : 'Confirmar reserva'}
            </button>
          )}

          {IS_ADMIN && reserva.estado !== 'cancelada' && (
            <button
              onClick={() => setModalCancelar(true)}
              disabled={accionando}
              className="px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              Cancelar reserva
            </button>
          )}
        </div>
      </div>

      {/* Modal de confirmación de cancelación */}
      {modalCancelar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              ¿Cancelar esta reserva?
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Esta acción cambiará el estado a <strong>Cancelada</strong>. Podés reactivarla
              editando la reserva.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalCancelar(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
              >
                Volver
              </button>
              <button
                onClick={handleCancelar}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
