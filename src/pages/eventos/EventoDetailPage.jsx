import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getEvento,
  updateEstadoEvento,
  updateEstadoReserva,
} from '../../services/eventosService'
import EstadoEventoBadge from '../../components/eventos/EstadoEventoBadge'
import EstadoReservaBadge from '../../components/eventos/EstadoReservaBadge'
import {
  formatearMonto,
  getEventoCliente,
  getEventoEstado,
  getEventoFecha,
  getEventoHoraFin,
  getEventoHoraInicio,
  getEventoInvitados,
  getEventoNombre,
  getEventoReserva,
  getEventoTipoId,
  getReservaEstado,
  getReservaMonto,
} from '../../utils/eventos'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTiposEvento } from '../../hooks/useTiposEvento'

function getTipoNombre(tipoEventoId, tiposById) {
  const tipo = tiposById?.[tipoEventoId]
  return tipo?.nombre ?? tipo?.name ?? `Tipo ${tipoEventoId ?? '-'}`
}

function formatFecha(fecha) {
  if (!fecha) return '-'
  try {
    return format(parseISO(fecha), 'dd/MM/yyyy', { locale: es })
  } catch {
    return fecha
  }
}

function formatHora(hora) {
  if (!hora) return '-'
  return String(hora).slice(0, 5)
}

function getFranjaLabel(horaInicio) {
  const hora = Number.parseInt(String(horaInicio ?? '').split(':')[0], 10)
  if (hora >= 6 && hora < 14) return 'manana'
  if (hora >= 14 && hora < 20) return 'tarde'
  return 'noche'
}

export default function EventoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tiposById } = useTiposEvento()

  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)

  const reserva = getEventoReserva(evento)
  const estadoEvento = getEventoEstado(evento)
  const estadoReserva = getReservaEstado(reserva)
  const hayInconsistencia = estadoEvento === 'en_curso' && estadoReserva === 'expirada'
  const cliente = getEventoCliente(evento)
  const horaInicio = getEventoHoraInicio(evento)
  const horaFin = getEventoHoraFin(evento)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getEvento(id)
        if (!cancelled) setEvento(data)
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.status === 404 ? 'Evento no encontrado' : 'Error al cargar el evento')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleCancelarEvento() {
    if (!evento) return
    setUpdating(true)
    try {
      const updated = await updateEstadoEvento(id, 'cancelado', evento.version)
      setEvento(updated)
    } catch {
      setError('No se pudo cancelar el evento')
    } finally {
      setUpdating(false)
    }
  }

  async function handleCancelarReserva() {
    if (!evento) return
    setUpdating(true)
    try {
      const updated = await updateEstadoReserva(id, 'cancelada', evento.version)
      setEvento(updated)
    } catch {
      setError('No se pudo cancelar la reserva')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500" data-testid="loading-indicator">
          Cargando evento...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div
            className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3 mb-4"
            role="alert"
            data-testid="error-indicator"
          >
            {error}
          </div>
          <button
            type="button"
            onClick={() => navigate('/eventos')}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            data-testid="btn-volver-lista"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="evento-detail-page">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {hayInconsistencia && (
          <div
            className="mb-5 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
            role="alert"
            data-testid="inconsistencia-alert"
          >
            <strong className="font-semibold">Inconsistencia detectada:</strong> el evento esta en
            curso pero la reserva se encuentra expirada. Revisa el estado de la reserva.
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800" data-testid="evento-nombre">
                {getEventoNombre(evento)}
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <EstadoEventoBadge estado={estadoEvento} />
                <EstadoReservaBadge estado={estadoReserva} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/eventos/${id}/editar`)}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                data-testid="btn-editar"
                disabled={updating}
              >
                Editar
              </button>
              <button
                type="button"
                onClick={handleCancelarEvento}
                className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                data-testid="btn-cancelar-evento"
                disabled={updating}
              >
                Cancelar evento
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" data-testid="card-evento">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Datos del evento
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-slate-500">Tipo</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-tipo">
                  {getTipoNombre(getEventoTipoId(evento), tiposById)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Fecha</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-fecha">
                  {formatFecha(getEventoFecha(evento))}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Horario</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-horario">
                  {formatHora(horaInicio)}-{formatHora(horaFin)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Franja</dt>
                <dd className="text-sm text-slate-800 capitalize" data-testid="detalle-franja">
                  {evento.franja ?? getFranjaLabel(horaInicio)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Invitados</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-invitados">
                  {getEventoInvitados(evento) ?? '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Descripcion</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-descripcion">
                  {evento.descripcion || '-'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" data-testid="card-cliente">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Cliente
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-slate-500">Nombre</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-cliente-nombre">
                  {cliente?.nombre ?? cliente?.name ?? 'Sin datos de cliente'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Email</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-cliente-email">
                  {cliente?.email ?? '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Telefono</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-cliente-telefono">
                  {cliente?.telefono ?? cliente?.phone ?? '-'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:col-span-2" data-testid="card-reserva">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Reserva
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-slate-500">Monto total</dt>
                <dd className="text-sm text-slate-800 font-medium" data-testid="detalle-monto">
                  {formatearMonto(getReservaMonto(reserva))}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Estado</dt>
                <dd className="mt-1">
                  <EstadoReservaBadge estado={estadoReserva} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Fecha de pago</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-fecha-pago">
                  {reserva?.fechaPago ? formatFecha(reserva.fechaPago) : 'Sin pagar'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Expiracion</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-expiracion">
                  {formatFecha(reserva?.expiraEn)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/eventos')}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            data-testid="btn-volver-lista"
          >
            Volver a la lista
          </button>
          <button
            type="button"
            onClick={() => navigate(`/eventos/${id}/editar`)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            data-testid="btn-editar-footer"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={handleCancelarReserva}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-testid="btn-cancelar-reserva"
            disabled={updating}
          >
            Cancelar reserva
          </button>
        </div>
      </div>
    </div>
  )
}
