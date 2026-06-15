import { ESTADOS_EVENTO } from '../../constants/eventos'

// Badge compacto para el estado de un evento.
export default function EstadoEventoBadge({ estado }) {
  const def = ESTADOS_EVENTO.find((e) => e.value === estado)
  if (!def) return null

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${def.badge}`}>
      {def.label}
    </span>
  )
}
