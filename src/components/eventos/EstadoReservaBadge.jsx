import { ESTADOS_RESERVA } from '../../constants/eventos'

export default function EstadoReservaBadge({ estado }) {
  const config = ESTADOS_RESERVA.find((e) => e.value === estado)
  const badge = config?.badge ?? 'bg-slate-100 text-slate-600'
  const label = config?.label ?? estado

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge}`}
      data-testid="estado-reserva-badge"
    >
      {label}
    </span>
  )
}
