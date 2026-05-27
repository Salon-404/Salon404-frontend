import { OCUPACION_UMBRAL_MEDIA } from '../../constants/mesas'

// Muestra la ocupación de una mesa con color según el nivel de llenado.
// variante 'compacto' → solo el número (para el canvas del plano)
// variante 'detalle'  → texto completo con barra de color (para la vista de asignación)
export default function OcupacionBadge({ asignados, capacidad, variante = 'detalle' }) {
  const ratio = capacidad > 0 ? asignados / capacidad : 0
  const llena = asignados >= capacidad

  let colorClasses
  if (llena) {
    colorClasses = 'bg-red-100 text-red-700 border-red-300'
  } else if (ratio >= OCUPACION_UMBRAL_MEDIA) {
    colorClasses = 'bg-yellow-100 text-yellow-800 border-yellow-300'
  } else {
    colorClasses = 'bg-green-100 text-green-800 border-green-300'
  }

  if (variante === 'compacto') {
    return (
      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${colorClasses}`}>
        {asignados}/{capacidad}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colorClasses}`}>
        {asignados}/{capacidad} {llena ? '— llena' : 'lugares'}
      </span>
    </div>
  )
}
