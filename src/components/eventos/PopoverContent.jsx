import { FRANJAS } from '../../constants/eventos'
import EstadoEventoBadge from './EstadoEventoBadge'
import EstadoReservaBadge from './EstadoReservaBadge'
import {
  getEventoCliente,
  getEventoEstado,
  getEventoHoraFin,
  getEventoHoraInicio,
  getEventoId,
  getEventoInvitados,
  getEventoNombre,
  getEventoTipoId,
  getTipoColor,
  getTipoNombre,
} from '../../utils/eventos'

const FRANJA_ORDER = ['manana', 'tarde', 'noche']
const RESERVED_LABEL = 'Horario reservado'

function inferirFranja(evento) {
  if (evento?.franja) return evento.franja
  const horaInicio = getEventoHoraInicio(evento) ?? ''
  const hora = Number.parseInt(horaInicio.split(':')[0], 10)
  if (hora >= 6 && hora < 14) return 'manana'
  if (hora >= 14 && hora < 20) return 'tarde'
  return 'noche'
}

function agruparPorFranja(eventos) {
  const grupos = {}

  for (const evento of eventos) {
    const franja = inferirFranja(evento)
    if (!grupos[franja]) grupos[franja] = []
    grupos[franja].push(evento)
  }

  for (const key of Object.keys(grupos)) {
    grupos[key].sort((a, b) =>
      (getEventoHoraInicio(a) ?? '').localeCompare(getEventoHoraInicio(b) ?? '')
    )
  }

  return grupos
}

function HoraLabel({ evento }) {
  const horaInicio = getEventoHoraInicio(evento)
  const horaFin = getEventoHoraFin(evento)

  return (
    <span className="text-xs font-medium text-slate-600">
      {horaInicio ?? ''}
      {horaFin ? `-${horaFin}` : ''}
    </span>
  )
}

function EventoCardAdmin({ evento, tipo }) {
  const estado = getEventoEstado(evento)
  const cancelado = estado === 'cancelado'
  const cliente = getEventoCliente(evento)
  const invitados = getEventoInvitados(evento)
  const reserva = evento.reserva ?? evento.reservation
  const estadoReserva = reserva?.estado ?? reserva?.status ?? reserva?.statusName

  return (
    <div className="flex items-stretch gap-2 rounded-lg px-2 py-2 hover:bg-slate-50 transition-colors cursor-pointer">
      <div
        className="w-0.5 rounded-full shrink-0"
        style={{ background: getTipoColor(tipo) }}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <HoraLabel evento={evento} />
          <div className="flex items-center gap-1.5">
            <EstadoEventoBadge estado={estado} />
            {estadoReserva && <EstadoReservaBadge estado={estadoReserva} />}
          </div>
        </div>
        <p className={`text-sm font-semibold text-slate-800 truncate ${cancelado ? 'line-through opacity-60' : ''}`}>
          {getEventoNombre(evento)}
        </p>
        <p className="text-xs text-slate-400 truncate">
          {cliente?.nombre ?? cliente?.name ?? ''}
          {invitados ? ` - ${invitados} invitados` : ''}
          {tipo ? ` - ${getTipoNombre(tipo)}` : ''}
        </p>
      </div>
    </div>
  )
}

function EventoCardPublic({ evento, tipo }) {
  return (
    <div className="flex items-stretch gap-2 rounded-lg px-2 py-2 hover:bg-slate-50 transition-colors">
      <div
        className="w-0.5 rounded-full shrink-0"
        style={{ background: getTipoColor(tipo) }}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <HoraLabel evento={evento} />
        </div>
        <p className="text-sm font-medium text-slate-500">
          {RESERVED_LABEL}
        </p>
      </div>
    </div>
  )
}

export default function PopoverContent({ eventos, tiposById, isAdmin }) {
  const grupos = agruparPorFranja(eventos)

  return (
    <>
      {FRANJA_ORDER.filter((f) => grupos[f]?.length).map((franjaKey) => {
        const franjaDef = Object.values(FRANJAS).find((f) => f.value === franjaKey)
        return (
          <div key={franjaKey} className="mb-3 last:mb-0">
            <div className={`flex items-center gap-1.5 px-1 py-1 rounded-md mb-1 ${franjaDef.color}`}>
              <span className="text-sm" aria-hidden="true">{franjaDef.icono}</span>
              <span className="text-xs font-semibold uppercase tracking-wider">
                {franjaDef.label}
              </span>
            </div>
            <div className="space-y-1">
              {grupos[franjaKey].map((evento, index) => {
                const tipo = tiposById[getEventoTipoId(evento)]
                const key = getEventoId(evento, `${franjaKey}-${index}`)
                return isAdmin ? (
                  <EventoCardAdmin key={key} evento={evento} tipo={tipo} />
                ) : (
                  <EventoCardPublic key={key} evento={evento} tipo={tipo} />
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}
