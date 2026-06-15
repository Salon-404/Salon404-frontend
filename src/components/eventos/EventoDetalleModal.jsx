import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import EstadoEventoBadge from './EstadoEventoBadge'
import EstadoReservaBadge from './EstadoReservaBadge'
import { formatearMonto } from '../../utils/eventos'
import { tiposEventoMock } from '../../mocks/tiposEventoMock'

function getTipoNombre(tipoEventoId) {
  const tipo = tiposEventoMock.find((t) => t.id === tipoEventoId)
  return tipo?.nombre ?? `Tipo ${tipoEventoId}`
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  return format(parseISO(fecha), 'dd/MM/yyyy', { locale: es })
}

export default function EventoDetalleModal({
  evento,
  abierto,
  onCerrar,
  onEditar,
  onCancelarEvento,
  onCancelarReserva,
}) {
  if (!abierto || !evento) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCerrar}
      data-testid="modal-detalle"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-800" data-testid="modal-titulo">
              {evento.nombre}
            </h2>
            <div className="mt-2 flex items-center gap-2">
              <EstadoEventoBadge estado={evento.estado} />
              <EstadoReservaBadge estado={evento.reserva?.estado} />
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
            aria-label="Cerrar"
            data-testid="btn-cerrar-modal"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Event info */}
          <section data-testid="seccion-evento">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Datos del evento
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-slate-500">Tipo</p>
                <p className="text-sm text-slate-800" data-testid="detalle-tipo">
                  {getTipoNombre(evento.tipoEventoId)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Fecha</p>
                <p className="text-sm text-slate-800" data-testid="detalle-fecha">
                  {formatFecha(evento.fecha)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Horario</p>
                <p className="text-sm text-slate-800" data-testid="detalle-horario">
                  {evento.horaInicio}–{evento.horaFin}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Franja</p>
                <p className="text-sm text-slate-800 capitalize" data-testid="detalle-franja">
                  {evento.franja}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Invitados</p>
                <p className="text-sm text-slate-800" data-testid="detalle-invitados">
                  {evento.cantidadInvitados}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500">Descripción</p>
                <p className="text-sm text-slate-800" data-testid="detalle-descripcion">
                  {evento.descripcion || '—'}
                </p>
              </div>
            </div>
          </section>

          {/* Client info */}
          <section data-testid="seccion-cliente">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Cliente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-slate-500">Nombre</p>
                <p className="text-sm text-slate-800" data-testid="detalle-cliente-nombre">
                  {evento.cliente?.nombre ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm text-slate-800" data-testid="detalle-cliente-email">
                  {evento.cliente?.email ?? '—'}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500">Teléfono</p>
                <p className="text-sm text-slate-800" data-testid="detalle-cliente-telefono">
                  {evento.cliente?.telefono ?? '—'}
                </p>
              </div>
            </div>
          </section>

          {/* Reservation info */}
          <section data-testid="seccion-reserva">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Reserva
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-slate-500">Monto total</p>
                <p className="text-sm text-slate-800 font-medium" data-testid="detalle-monto">
                  {formatearMonto(evento.reserva?.montoTotal)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Estado</p>
                <div className="mt-1">
                  <EstadoReservaBadge estado={evento.reserva?.estado} />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Fecha de pago</p>
                <p className="text-sm text-slate-800" data-testid="detalle-fecha-pago">
                  {evento.reserva?.fechaPago ? formatFecha(evento.reserva.fechaPago) : 'Sin pagar'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Expiración</p>
                <p className="text-sm text-slate-800" data-testid="detalle-expiracion">
                  {formatFecha(evento.reserva?.expiraEn)}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button
            type="button"
            onClick={onEditar}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            data-testid="btn-editar"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={onCancelarEvento}
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
            data-testid="btn-cancelar-evento"
          >
            Cancelar evento
          </button>
          <button
            type="button"
            onClick={onCancelarReserva}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            data-testid="btn-cancelar-reserva"
          >
            Cancelar reserva
          </button>
        </div>
      </div>
    </div>
  )
}
