const CANTIDAD_SKELETONS = 3

function calcularDuracionHumana(inicio, fin) {
  const [h1, m1] = inicio.split(':').map(Number)
  const [h2, m2] = fin.split(':').map(Number)
  const minutos = h2 * 60 + m2 - h1 * 60 - m1
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  if (mins === 0) return `${horas} horas`
  return `${horas} horas ${mins} minutos`
}

function esMismoHorario(a, b) {
  if (!a || !b) return false
  return a.inicio === b.inicio && a.fin === b.fin
}

function SkeletonCard() {
  return (
    <div
      className="border border-slate-200 rounded-md p-4 animate-pulse"
      aria-hidden="true"
      data-testid="horario-skeleton"
    >
      <div className="h-5 bg-slate-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-slate-200 rounded w-1/3" />
    </div>
  )
}

/**
 * Lista de horarios disponibles para seleccionar
 * @param {Object} props
 * @param {Array<{inicio: string, fin: string}>} props.horarios - Lista de horarios disponibles
 * @param {{inicio: string, fin: string}|null} props.horarioSeleccionado - Horario actualmente seleccionado
 * @param {Function} props.onSeleccionarHorario - Callback al hacer click en un horario, recibe {inicio, fin}
 * @param {boolean} [props.loading] - Estado de carga
 * @param {string|null} [props.error] - Mensaje de error
 * @returns {JSX.Element}
 */
export default function SelectorHorarios({ horarios = [], loading = false, onSeleccionar }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-slate-200 rounded-md p-4 animate-pulse">
            <div className="h-5 bg-slate-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  if (!horarios.length) {
    return (
      <div className="border border-slate-200 bg-slate-50 text-slate-600 rounded-md p-4 text-sm">
        No hay horarios disponibles para este día y tipo de evento
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {horarios.map((horario) => (
        <button
          key={`${horario.startTime}-${horario.endTime}`}
          type="button"
          onClick={() => onSeleccionar && onSeleccionar(horario)}
          className="border border-slate-200 rounded-md p-4 text-left w-full hover:border-indigo-300 transition-colors"
        >
          <div className="text-base font-semibold text-slate-800">
            {horario.startTime} - {horario.endTime}
          </div>
        </button>
      ))}
    </div>
  )
}
