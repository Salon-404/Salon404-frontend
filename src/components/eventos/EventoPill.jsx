import {
  getEventoEstado,
  getEventoHoraInicio,
  getEventoNombre,
  getTipoColor,
} from '../../utils/eventos'

const RESERVED_LABEL = 'Horario reservado'

function AccentBar({ color }) {
  return (
    <span
      className="shrink-0 w-0.5 self-stretch rounded-full"
      style={{ background: color }}
      aria-hidden="true"
    />
  )
}

export default function EventoPill({ evento, tipo, isAdmin = false }) {
  const color = getTipoColor(tipo)
  const horaInicio = getEventoHoraInicio(evento) ?? ''
  const bg = `${color}14`
  const cancelado = getEventoEstado(evento) === 'cancelado'
  const displayName = isAdmin ? getEventoNombre(evento) : RESERVED_LABEL

  return (
    <div
      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-slate-700 cursor-pointer overflow-hidden w-full"
      style={{ background: bg, opacity: cancelado ? 0.6 : 1 }}
      title={`${horaInicio} ${displayName}`.trim()}
    >
      <AccentBar color={color} />
      <span className="text-slate-400 shrink-0">{horaInicio}</span>
      <span
        className={`truncate font-medium ${cancelado ? 'line-through' : ''}`}
        style={{ color }}
      >
        {displayName}
      </span>
    </div>
  )
}
