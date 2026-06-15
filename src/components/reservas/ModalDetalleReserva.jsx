import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import StatusBadge from './StatusBadge'
import { TIPOS_EVENTO } from '../../constants/reservas'

function getTipoLabel(value) {
  return TIPOS_EVENTO.find((t) => t.value === value)?.label ?? value
}

export default function ModalDetalleReserva({ reserva, abierto, onCerrar, onEditar, onCancelar }) {
  if (!abierto || !reserva) return null

  const fechaFormateada = format(parseISO(reserva.fecha), 'dd/MM/yyyy', { locale: es })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCerrar}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Detalle de Reserva</h2>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase">Fecha</label>
            <p className="text-sm text-slate-700 mt-1">{fechaFormateada}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase">Horario</label>
            <p className="text-sm text-slate-700 mt-1">{reserva.horaInicio}–{reserva.horaFin}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase">Cliente</label>
            <p className="text-sm text-slate-700 mt-1">{reserva.nombreCliente}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase">Email</label>
            <p className="text-sm text-slate-700 mt-1">{reserva.email}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase">Teléfono</label>
            <p className="text-sm text-slate-700 mt-1">{reserva.telefono}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase">Tipo de Evento</label>
            <p className="text-sm text-slate-700 mt-1">{getTipoLabel(reserva.tipoEvento)}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase">Invitados</label>
            <p className="text-sm text-slate-700 mt-1">{reserva.cantidadInvitados}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase">Notas</label>
            <p className="text-sm text-slate-700 mt-1">{reserva.notas || '—'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase">Estado</label>
            <div className="mt-1"><StatusBadge estado={reserva.estado} /></div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button onClick={onCerrar} className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50">
            Cerrar
          </button>
          <button onClick={onEditar} className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50">
            Editar
          </button>
          <button onClick={onCancelar} className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
            Cancelar reserva
          </button>
        </div>
      </div>
    </div>
  )
}