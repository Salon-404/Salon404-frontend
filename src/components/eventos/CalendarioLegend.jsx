import { FRANJAS } from '../../constants/eventos'
import { getTipoColor, getTipoId, getTipoNombre } from '../../utils/eventos'

const FRANJA_DOT_COLORS = {
  manana: 'bg-amber-400',
  tarde: 'bg-orange-400',
  noche: 'bg-indigo-500',
}

function FranjaItem({ franja }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-500">
      <span
        className={`inline-block h-2 w-2 rounded-full shrink-0 ${FRANJA_DOT_COLORS[franja.value] || 'bg-slate-300'}`}
        aria-hidden="true"
      />
      {franja.label}
    </span>
  )
}

function TipoItem({ tipo }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-600">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
        style={{ background: getTipoColor(tipo) }}
        aria-hidden="true"
      />
      {getTipoNombre(tipo)}
    </span>
  )
}

function EstadoItem({ color, label }) {
  return (
    <span className="flex items-center gap-1 text-xs text-slate-400">
      <span className={`inline-block h-2 w-2 rounded-sm ${color}`} aria-hidden="true" />
      {label}
    </span>
  )
}

export default function CalendarioLegend({ tipos = [] }) {
  const activos = tipos.filter((t) => t.activo ?? t.active ?? true)
  const franjasList = Object.values(FRANJAS)
  const hasContent = activos.length > 0 || franjasList.length > 0

  if (!hasContent) return null

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 px-1">
      {/* Franjas horarias */}
      {franjasList.map((franja) => (
        <FranjaItem key={franja.value} franja={franja} />
      ))}

      {activos.length > 0 && (
        <span className="h-3 w-px bg-slate-200 mx-1" aria-hidden="true" />
      )}

      {/* Tipos de evento */}
      {activos.map((tipo) => (
        <TipoItem key={getTipoId(tipo)} tipo={tipo} />
      ))}

      <span className="h-3 w-px bg-slate-200 mx-1" aria-hidden="true" />

      {/* Estados */}
      <EstadoItem color="bg-yellow-300" label="Pendiente" />
      <EstadoItem color="bg-green-400" label="Finalizado" />
      <EstadoItem color="bg-slate-300" label="Cancelado" />
    </div>
  )
}
