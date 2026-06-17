import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getEvento,
  updateEstadoEvento,
  updateEstadoReserva,
} from '../../services/eventosService'
import EstadoEventoBadge from '../../components/eventos/EstadoEventoBadge'
import EstadoReservaBadge from '../../components/eventos/EstadoReservaBadge'
import { formatearMonto } from '../../utils/eventos'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTiposEvento } from '../../hooks/useTiposEvento'

function getTipoNombre(tipoEventoId, tiposById) {
  const tipo = tiposById?.[tipoEventoId]
  return tipo?.nombre ?? `Tipo ${tipoEventoId}`
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  return format(parseISO(fecha), 'dd/MM/yyyy', { locale: es })
}

export default function EventoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tiposById } = useTiposEvento()

  const [evento, setEvento] = useState(null)
  const hayInconsistencia = evento?.estado === 'en_curso' && evento?.reserva?.estado === 'expirada'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)

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
    } catch (err) {
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
    } catch (err) {
      setError('No se pudo cancelar la reserva')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500" data-testid="loading-indicator">
          Cargando evento…
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
        <button
          type="button"
          onClick={() => navigate('/eventos')}
          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-4"
          data-testid="btn-volver"
        >
          ← Volver a Eventos
        </button>

        {hayInconsistencia && (
          <div
            className="mb-5 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
            role="alert"
            data-testid="inconsistencia-alert"
          >
            <strong className="font-semibold">Inconsistencia detectada:</strong> el evento está en
            curso pero la reserva se encuentra expirada. Revisá el estado de la reserva.
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800" data-testid="evento-nombre">
                {evento.nombre}
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <EstadoEventoBadge estado={evento.estado} />
                <EstadoReservaBadge estado={evento.reserva?.estado} />
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
          {/* Event info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" data-testid="card-evento">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Datos del evento
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-slate-500">Tipo</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-tipo">
                  {getTipoNombre(evento.tipoEventoId, tiposById)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Fecha</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-fecha">
                  {formatFecha(evento.fecha)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Horario</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-horario">
                  {evento.horaInicio}–{evento.horaFin}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Franja</dt>
                <dd className="text-sm text-slate-800 capitalize" data-testid="detalle-franja">
                  {evento.franja}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Invitados</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-invitados">
                  {evento.cantidadInvitados}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Descripción</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-descripcion">
                  {evento.descripcion || '—'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Client info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" data-testid="card-cliente">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Cliente
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-slate-500">Nombre</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-cliente-nombre">
                  {evento.cliente?.nombre ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Email</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-cliente-email">
                  {evento.cliente?.email ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Teléfono</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-cliente-telefono">
                  {evento.cliente?.telefono ?? '—'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Reservation info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:col-span-2" data-testid="card-reserva">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Reserva
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-slate-500">Monto total</dt>
                <dd className="text-sm text-slate-800 font-medium" data-testid="detalle-monto">
                  {formatearMonto(evento.reserva?.montoTotal)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Estado</dt>
                <dd className="mt-1">
                  <EstadoReservaBadge estado={evento.reserva?.estado} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Fecha de pago</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-fecha-pago">
                  {evento.reserva?.fechaPago ? formatFecha(evento.reserva.fechaPago) : 'Sin pagar'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Expiración</dt>
                <dd className="text-sm text-slate-800" data-testid="detalle-expiracion">
                  {formatFecha(evento.reserva?.expiraEn)}
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
