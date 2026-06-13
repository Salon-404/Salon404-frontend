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
  if (!tipo) return null

  const bg = `${tipo.color}14`
  const cancelado = evento.estado === 'cancelado'
  const displayName = isAdmin ? evento.nombre : RESERVED_LABEL

  return (
    <div
      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-slate-700 cursor-pointer overflow-hidden w-full"
      style={{ background: bg, opacity: cancelado ? 0.6 : 1 }}
      title={`${evento.horaInicio} ${displayName}`}
    >
      <AccentBar color={tipo.color} />
      <span className="text-slate-400 shrink-0">{evento.horaInicio}</span>
      <span
        className={`truncate font-medium ${cancelado ? 'line-through' : ''}`}
        style={{ color: tipo.color }}
      >
        {displayName}
      </span>
    </div>
  )
}
