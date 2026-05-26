import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import StatusBadge from './StatusBadge'
import { TIPOS_EVENTO } from '../../constants/reservas'

function getTipoLabel(value) {
  return TIPOS_EVENTO.find((t) => t.value === value)?.label ?? value
}

export default function ReservaCard({ reserva }) {
  const fechaFormateada = format(parseISO(reserva.fecha), 'dd/MM/yyyy', { locale: es })

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{fechaFormateada}</td>
      <td className="px-4 py-3 text-sm text-slate-700">{reserva.nombreCliente}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{getTipoLabel(reserva.tipoEvento)}</td>
      <td className="px-4 py-3">
        <StatusBadge estado={reserva.estado} />
      </td>
      <td className="px-4 py-3 text-sm">
        <Link
          to={`/reservas/${reserva.id}`}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Ver detalle
        </Link>
      </td>
    </tr>
  )
}
