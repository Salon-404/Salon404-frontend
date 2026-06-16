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
export default function SelectorHorarios({
  horarios = [],
  horarioSeleccionado = null,
  onSeleccionarHorario,
  loading = false,
  error = null,
}) {
  if (loading) {
    return (
      <div className="space-y-2" data-testid="selector-horarios-loading">
        {Array.from({ length: CANTIDAD_SKELETONS }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="border border-red-300 bg-red-50 text-red-700 rounded-md p-4 text-sm"
        role="alert"
        data-testid="selector-horarios-error"
      >
        {error}
      </div>
    )
  }

  if (!horarios || horarios.length === 0) {
    return (
      <div
        className="border border-slate-200 bg-slate-50 text-slate-600 rounded-md p-4 text-sm"
        data-testid="selector-horarios-vacio"
      >
        No hay horarios disponibles para este día y tipo de evento
      </div>
    )
  }

  return (
    <div className="space-y-2" role="list" data-testid="selector-horarios">
      {horarios.map((horario) => {
        const seleccionado = esMismoHorario(horario, horarioSeleccionado)
        const clases = [
          'border rounded-md p-4 cursor-pointer transition-colors text-left w-full',
          seleccionado
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-slate-200 hover:border-indigo-300',
        ].join(' ')

        return (
          <button
            key={`${horario.inicio}-${horario.fin}`}
            type="button"
            role="listitem"
            aria-pressed={seleccionado}
            data-inicio={horario.inicio}
            data-fin={horario.fin}
            onClick={() => onSeleccionarHorario && onSeleccionarHorario(horario)}
            className={clases}
          >
            <div className="text-base font-semibold text-slate-800">
              {horario.inicio} - {horario.fin}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              ({calcularDuracionHumana(horario.inicio, horario.fin)})
            </div>
          </button>
        )
      })}
    </div>
  )
}
