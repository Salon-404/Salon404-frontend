import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const UMBRAL_OCUPACION_PORCENTAJE = 50
const MINUTOS_VENTANA_POR_DIA = 24 * 60

function getReservasDelDia(fechaStr, reservas) {
  return reservas.filter((r) => r.fecha === fechaStr)
}

function esDiaCompleto(reservasDelDia) {
  if (reservasDelDia.length === 0) return false
  const minutosOcupados = reservasDelDia.reduce((acc, r) => {
    if (!r.horaInicio || !r.horaFin) return acc
    const [h1, m1] = r.horaInicio.split(':').map(Number)
    const [h2, m2] = r.horaFin.split(':').map(Number)
    return acc + (h2 * 60 + m2 - h1 * 60 - m1)
  }, 0)
  const umbralMinutos = (MINUTOS_VENTANA_POR_DIA * UMBRAL_OCUPACION_PORCENTAJE) / 100
  return minutosOcupados > umbralMinutos
}

/**
 * Calendario mensual de disponibilidad con estados visuales para cada día
 * @param {Object} props
 * @param {string|null} props.fechaSeleccionada - Fecha seleccionada en formato YYYY-MM-DD
 * @param {Function} props.onSeleccionarDia - Callback al seleccionar un día disponible, recibe fecha en YYYY-MM-DD
 * @param {Array} [props.reservas] - Reservas del salón para marcar días con ocupación
 * @param {string} [props.mesActual] - Mes a mostrar en formato YYYY-MM (default: mes actual)
 * @returns {JSX.Element}
 */
export default function CalendarioDisponibilidad({
  fechaSeleccionada,
  onSeleccionarDia,
  reservas = [],
  mesActual,
}) {
  const fechaInicial = mesActual ? parseISO(`${mesActual}-01`) : new Date()
  const [mesVisible, setMesVisible] = useState(fechaInicial)
  const hoy = new Date()

  const primerDiaMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1)
  const ultimoDiaMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 0)

  const inicioGrilla = new Date(primerDiaMes)
  inicioGrilla.setDate(inicioGrilla.getDate() - primerDiaMes.getDay())

  const finGrilla = new Date(ultimoDiaMes)
  const diasParaCompletar = 6 - ultimoDiaMes.getDay()
  finGrilla.setDate(finGrilla.getDate() + diasParaCompletar)

  const dias = []
  const cursor = new Date(inicioGrilla)
  while (cursor <= finGrilla) {
    dias.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  function handleClick(dia, fechaStr, deshabilitado) {
    if (deshabilitado) return
    if (onSeleccionarDia) onSeleccionarDia(fechaStr)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4" data-testid="calendario-disponibilidad">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() - 1, 1))}
          aria-label="Mes anterior"
          className="px-3 py-1 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
        >
          ‹ Anterior
        </button>
        <h2 className="text-lg font-semibold text-slate-800 capitalize" data-testid="calendario-titulo">
          {format(mesVisible, 'LLLL yyyy', { locale: es })}
        </h2>
        <button
          type="button"
          onClick={() => setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 1))}
          aria-label="Mes siguiente"
          className="px-3 py-1 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
        >
          Siguiente ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2" role="row">
        {DIAS_SEMANA.map((dia) => (
          <div
            key={dia}
            role="columnheader"
            className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide py-1"
          >
            {dia}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Calendario de disponibilidad">
        {dias.map((dia) => {
          const fechaStr = format(dia, 'yyyy-MM-dd')
          const enMes = dia.getMonth() === mesVisible.getMonth()
          const esHoy = dia.toDateString() === hoy.toDateString()
          const esSeleccionado = fechaSeleccionada === fechaStr
          const reservasDelDia = getReservasDelDia(fechaStr, reservas)
          const deshabilitado = esDiaCompleto(reservasDelDia)

          let clases = 'aspect-square flex items-center justify-center rounded-md text-sm transition-colors'
          if (!enMes) {
            clases += ' opacity-50 text-slate-400'
          } else if (deshabilitado) {
            clases += ' bg-slate-200 text-slate-500 cursor-not-allowed'
          } else {
            clases += ' bg-green-100 hover:bg-green-200 text-green-800 cursor-pointer'
          }
          if (esSeleccionado) clases += ' ring-2 ring-indigo-500 font-bold'
          if (esHoy && !esSeleccionado) clases += ' font-bold underline'

          const estadoLabel = deshabilitado
            ? 'completo'
            : reservasDelDia.length > 0
              ? 'tiene reservas'
              : 'disponible'
          const fechaLabel = format(dia, "d 'de' MMMM", { locale: es })
          const ariaLabel = `${fechaLabel}, ${estadoLabel}`

          return (
            <button
              key={fechaStr}
              type="button"
              role="gridcell"
              disabled={deshabilitado}
              aria-label={ariaLabel}
              aria-current={esHoy ? 'date' : undefined}
              aria-pressed={esSeleccionado}
              data-fecha={fechaStr}
              data-estado={estadoLabel}
              onClick={() => handleClick(dia, fechaStr, deshabilitado)}
              className={clases}
            >
              {dia.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
