import { ESTADOS_RESERVA } from '../../constants/eventos'
import { normalizeEstadoReserva } from '../../utils/eventos'

export default function EstadoReservaBadge({ estado }) {
  const estadoNormalizado = normalizeEstadoReserva(estado)
  const config = ESTADOS_RESERVA.find((e) => e.value === estadoNormalizado)
  const badge = config?.badge ?? 'bg-slate-100 text-slate-600'
  const label = config?.label ?? (estadoNormalizado || 'Sin reserva')

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge}`}
      data-testid="estado-reserva-badge"
    >
      {label}
    </span>
  )
}
