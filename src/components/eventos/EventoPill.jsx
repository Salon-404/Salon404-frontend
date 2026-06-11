// Pill compacto para FullCalendar eventContent.
export default function EventoPill({ evento, tipo }) {
  if (!tipo) return null

  // Fondo: tinte muy claro del color del tipo (8% opacidad vía hex 14)
  const bg = `${tipo.color}14`
  const cancelado = evento.estado === 'cancelado'

  return (
    <div
      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-slate-700 cursor-pointer overflow-hidden w-full"
      style={{ background: bg, opacity: cancelado ? 0.6 : 1 }}
      title={`${evento.horaInicio} ${evento.nombre}`}
    >
      {/* Barra de acento lateral */}
      <span
        className="shrink-0 w-0.5 self-stretch rounded-full"
        style={{ background: tipo.color }}
        aria-hidden="true"
      />
      <span className="text-slate-400 shrink-0">{evento.horaInicio}</span>
      <span
        className={`truncate font-medium ${cancelado ? 'line-through' : ''}`}
        style={{ color: tipo.color }}
      >
        {evento.nombre}
      </span>
    </div>
  )
}
