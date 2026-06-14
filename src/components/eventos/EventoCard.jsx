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

export default function EventoCard({ evento, onSeleccionar }) {
  return (
    <tr
      onClick={() => onSeleccionar(evento)}
      className="hover:bg-slate-50 cursor-pointer"
      data-testid="evento-card"
    >
      <td className="px-4 py-3 text-sm text-slate-700">
        {format(parseISO(evento.fecha), 'dd/MM/yyyy', { locale: es })}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {evento.horaInicio}–{evento.horaFin}
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">
        {evento.cliente?.nombre ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {getTipoNombre(evento.tipoEventoId)}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {evento.cantidadInvitados}
      </td>
      <td className="px-4 py-3">
        <EstadoEventoBadge estado={evento.estado} />
      </td>
      <td className="px-4 py-3">
        <EstadoReservaBadge estado={evento.reserva?.estado} />
      </td>
      <td className="px-4 py-3 text-sm text-slate-700 font-medium">
        {formatearMonto(evento.reserva?.montoTotal)}
      </td>
    </tr>
  )
}
