import { ESTADOS_EVENTO } from '../../constants/eventos'
import { normalizeEstadoEvento } from '../../utils/eventos'

export default function EstadoEventoBadge({ estado }) {
  const estadoNormalizado = normalizeEstadoEvento(estado)
  const config = ESTADOS_EVENTO.find((e) => e.value === estadoNormalizado)
  const badge = config?.badge ?? 'bg-slate-100 text-slate-600'
  const label = config?.label ?? estadoNormalizado ?? 'Sin estado'

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge}`}
      data-testid="estado-evento-badge"
    >
      {label}
    </span>
  )
}
