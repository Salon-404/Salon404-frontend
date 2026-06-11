// Leyenda horizontal de tipos de evento y estados relevantes.
export default function CalendarioLegend({ tipos = [] }) {
  const activos = tipos.filter((t) => t.activo)
  if (activos.length === 0) return null

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      {activos.map((tipo) => (
        <span key={tipo.id} className="flex items-center gap-1.5 text-xs text-slate-600">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
            style={{ background: tipo.color }}
            aria-hidden="true"
          />
          {tipo.nombre}
        </span>
      ))}

      {/* Separador sutil */}
      <span className="h-3 w-px bg-slate-300 mx-1" aria-hidden="true" />

      {/* Hints de estado */}
      <span className="flex items-center gap-1 text-xs text-slate-400">
        <span className="inline-block h-2 w-2 rounded-sm bg-yellow-300" aria-hidden="true" />
        Pendiente
      </span>
      <span className="flex items-center gap-1 text-xs text-slate-400">
        <span className="inline-block h-2 w-2 rounded-sm bg-green-400" aria-hidden="true" />
        Finalizado
      </span>
      <span className="flex items-center gap-1 text-xs text-slate-400">
        <span className="inline-block h-2 w-2 rounded-sm bg-slate-300" aria-hidden="true" />
        Cancelado
      </span>
    </div>
  )
}
