import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import EstadoEventoBadge from './EstadoEventoBadge'
import EstadoReservaBadge from './EstadoReservaBadge'
import { formatearMonto } from '../../utils/eventos'

function getTipoNombre(tipoEventoId, tiposById) {
  const tipo = tiposById?.[tipoEventoId]
  return tipo?.nombre ?? `Tipo ${tipoEventoId}`
}

export default function EventoCard({ evento, onSeleccionar, tiposById = {} }) {
  const hayInconsistencia = evento.estado === 'en_curso' && evento.reserva?.estado === 'expirada'

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
        {getTipoNombre(evento.tipoEventoId, tiposById)}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {evento.cantidadInvitados}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <EstadoEventoBadge estado={evento.estado} />
          {hayInconsistencia && (
            <span
              className="text-yellow-600"
              title="Inconsistencia: el evento está en curso pero la reserva expiró"
              data-testid="inconsistencia-warning"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.652 11.526c.673 1.167-.17 2.625-1.516 2.625H3.35c-1.346 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5Zm0 9a1 1 0 100-2 1 1 0 000 2Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </div>
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
