import { FRANJAS } from '../../constants/eventos'
import EstadoEventoBadge from './EstadoEventoBadge'
<<<<<<< HEAD
import EstadoReservaBadge from './EstadoReservaBadge'
=======
>>>>>>> origin/develop

const FRANJA_ORDER = ['manana', 'tarde', 'noche']
const RESERVED_LABEL = 'Horario reservado'

function agruparPorFranja(eventos) {
  const grupos = {}
  for (const e of eventos) {
    if (!grupos[e.franja]) grupos[e.franja] = []
    grupos[e.franja].push(e)
  }
  for (const key of Object.keys(grupos)) {
    grupos[key].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  }
  return grupos
}

function EventoCardAdmin({ evento, tipo }) {
  const cancelado = evento.estado === 'cancelado'

  return (
    <div className="flex items-stretch gap-2 rounded-lg px-2 py-2 hover:bg-slate-50 transition-colors cursor-pointer">
      <div
        className="w-0.5 rounded-full shrink-0"
        style={{ background: tipo?.color ?? '#94a3b8' }}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-600">
            {evento.horaInicio}–{evento.horaFin}
          </span>
<<<<<<< HEAD
          <div className="flex items-center gap-1.5">
            <EstadoEventoBadge estado={evento.estado} />
            {evento.reserva?.estado && (
              <EstadoReservaBadge estado={evento.reserva.estado} />
            )}
          </div>
=======
          <EstadoEventoBadge estado={evento.estado} />
>>>>>>> origin/develop
        </div>
        <p className={`text-sm font-semibold text-slate-800 truncate ${cancelado ? 'line-through opacity-60' : ''}`}>
          {evento.nombre}
        </p>
        <p className="text-xs text-slate-400 truncate">
          {evento.cliente?.nombre}
          {evento.cantidadInvitados ? ` · ${evento.cantidadInvitados} invitados` : ''}
          {tipo ? ` · ${tipo.nombre}` : ''}
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
        style={{ background: tipo?.color ?? '#94a3b8' }}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-600">
            {evento.horaInicio}–{evento.horaFin}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
          <span aria-hidden="true">🔒</span>
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
              {grupos[franjaKey].map((evento) => {
                const tipo = tiposById[evento.tipoEventoId]
                return isAdmin ? (
                  <EventoCardAdmin key={evento.id} evento={evento} tipo={tipo} />
                ) : (
                  <EventoCardPublic key={evento.id} evento={evento} tipo={tipo} />
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}
