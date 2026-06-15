const CANTIDAD_SKELETONS = 3
const TOTAL_SEGUNDOS_BLOQUEO = 600

function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60)
  const segs = segundos % 60
  return `${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`
}

function formatearTiempoHumano(segundos) {
  const minutos = Math.floor(segundos / 60)
  const segs = segundos % 60
  if (segs === 0) return `${minutos} minutos`
  return `${minutos} minutos ${segs} segundos`
}

function colorSegunTiempo(segundos) {
  if (segundos > 300) return 'text-slate-700'
  if (segundos >= 120) return 'text-yellow-600'
  return 'text-red-600 font-bold'
}

function etiquetaSegunTiempo(segundos) {
  if (segundos > 300) return 'Quedan'
  if (segundos >= 120) return 'Quedan'
  return 'Quedan menos de'
}

/**
 * Muestra el tiempo restante de bloqueo de un horario, con colores y barra de progreso
 * @param {Object} props
 * @param {number} props.segundosRestantes - Segundos restantes del bloqueo
 * @param {number} [props.totalSegundos] - Total de segundos para el cálculo de porcentaje (default 600)
 * @returns {JSX.Element}
 */
export default function CountdownReserva({
  segundosRestantes = 0,
  totalSegundos = TOTAL_SEGUNDOS_BLOQUEO,
}) {
  const porcentaje = Math.max(0, Math.min(100, (segundosRestantes / totalSegundos) * 100))
  const colorClass = colorSegunTiempo(segundosRestantes)

  return (
    <div
      className="flex items-center gap-3"
      role="timer"
      aria-live="polite"
      data-testid="countdown-reserva"
    >
      <span className="text-2xl" aria-hidden="true">⏱️</span>
      <div className="flex-1">
        <div className={`text-lg font-mono font-semibold ${colorClass}`} data-testid="countdown-tiempo">
          {formatearTiempo(segundosRestantes)}
        </div>
        <div className="sr-only">
          Quedan {formatearTiempoHumano(segundosRestantes)}
        </div>
        <div className="mt-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden" aria-hidden="true">
          <div
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${porcentaje}%` }}
            data-testid="countdown-progreso"
          />
        </div>
        <div className="text-xs text-slate-500 mt-1" aria-hidden="true">
          {etiquetaSegunTiempo(segundosRestantes)} {formatearTiempoHumano(segundosRestantes)}
        </div>
      </div>
    </div>
  )
}
