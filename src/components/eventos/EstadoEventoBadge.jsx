import { ESTADOS_EVENTO } from '../../constants/eventos'

<<<<<<< HEAD
export default function EstadoEventoBadge({ estado }) {
  const config = ESTADOS_EVENTO.find((e) => e.value === estado)
  const badge = config?.badge ?? 'bg-slate-100 text-slate-600'
  const label = config?.label ?? estado

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge}`}
      data-testid="estado-evento-badge"
    >
      {label}
=======
// Badge compacto para el estado de un evento.
export default function EstadoEventoBadge({ estado }) {
  const def = ESTADOS_EVENTO.find((e) => e.value === estado)
  if (!def) return null

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${def.badge}`}>
      {def.label}
>>>>>>> origin/develop
    </span>
  )
}
