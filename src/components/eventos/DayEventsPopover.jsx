import { useEffect, useState, useRef } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { FRANJAS } from '../../constants/eventos'
import EstadoEventoBadge from './EstadoEventoBadge'

// Orden fijo de franjas en el popover.
const FRANJA_ORDER = ['manana', 'tarde', 'noche']

// Agrupa eventos por franja y ordena por horaInicio dentro de cada grupo.
function agruparPorFranja(eventos) {
  const grupos = {}
  for (const e of eventos) {
    if (!grupos[e.franja]) grupos[e.franja] = []
    grupos[e.franja].push(e)
  }
  for (const key of Object.keys(grupos)) {
    grupos[key].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  }
  return grupos
}

// Calcula posición fixed del popover a partir del rect de la celda.
function calcPosition(anchorRect, popoverWidth = 320, popoverHeight = 420) {
  const margin = 8
  const vw = window.innerWidth
  const vh = window.innerHeight

  let left = anchorRect.right + margin
  let top = anchorRect.top

  // Flip a la izquierda si desborda a la derecha
  if (left + popoverWidth > vw - margin) {
    left = anchorRect.left - popoverWidth - margin
  }
  // Clamp horizontalmente
  left = Math.max(margin, Math.min(left, vw - popoverWidth - margin))

  // Ajustar verticalmente si desborda abajo
  if (top + popoverHeight > vh - margin) {
    top = vh - popoverHeight - margin
  }
  top = Math.max(margin, top)

  return { left, top }
}

export default function DayEventsPopover({
  fecha,
  eventos,
  tiposById,
  anchorRect,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) {
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState({ left: 0, top: 0 })
  const popoverRef = useRef(null)

  // Transición de entrada
  useEffect(() => {
    setMounted(true)
  }, [])

  // Recalcular posición cuando cambia anchorRect
  useEffect(() => {
    if (!anchorRect) return
    const popH = popoverRef.current ? popoverRef.current.offsetHeight : 420
    setPos(calcPosition(anchorRect, 320, popH))
  }, [anchorRect])

  // Recalcular después de montaje para tener altura real
  useEffect(() => {
    if (mounted && popoverRef.current && anchorRect) {
      setPos(calcPosition(anchorRect, 320, popoverRef.current.offsetHeight))
    }
  }, [mounted, anchorRect])

  // Cerrar con Escape
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  if (!eventos || eventos.length === 0) return null

  const grupos = agruparPorFranja(eventos)

  const fechaFormateada = (() => {
    try {
      return format(parseISO(fecha), "EEEE d 'de' MMMM", { locale: es })
    } catch {
      return fecha
    }
  })()

  // Capitalizar primera letra
  const fechaLabel = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="false"
      aria-label={`Eventos del ${fechaLabel}`}
      className={`day-popover fixed z-50 w-80 rounded-xl border border-slate-200 bg-white shadow-xl transition-all duration-150 ${
        mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{ left: pos.left, top: pos.top, maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">{fechaLabel}</span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
            {eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Cerrar"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Body con scroll */}
      <div className="day-popover-scroll overflow-y-auto flex-1 px-3 py-2">
        {FRANJA_ORDER.filter((f) => grupos[f]?.length).map((franjaKey) => {
          const franjaDef = Object.values(FRANJAS).find((f) => f.value === franjaKey)
          return (
            <div key={franjaKey} className="mb-3 last:mb-0">
              {/* Header de franja */}
              <div className={`flex items-center gap-1.5 px-1 py-1 rounded-md mb-1 ${franjaDef.color}`}>
                <span className="text-sm" aria-hidden="true">{franjaDef.icono}</span>
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {franjaDef.label}
                </span>
              </div>

              {/* Eventos de la franja */}
              <div className="space-y-1">
                {grupos[franjaKey].map((evento) => {
                  const tipo = tiposById[evento.tipoEventoId]
                  const cancelado = evento.estado === 'cancelado'
                  return (
                    <div
                      key={evento.id}
                      className="flex items-stretch gap-2 rounded-lg px-2 py-2 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {/* Barra de color del tipo */}
                      <div
                        className="w-0.5 rounded-full shrink-0"
                        style={{ background: tipo?.color ?? '#94a3b8' }}
                        aria-hidden="true"
                      />
                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-slate-600">
                            {evento.horaInicio}–{evento.horaFin}
                          </span>
                          <EstadoEventoBadge estado={evento.estado} />
                        </div>
                        <p
                          className={`text-sm font-semibold text-slate-800 truncate ${
                            cancelado ? 'line-through opacity-60' : ''
                          }`}
                        >
                          {evento.nombre}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {evento.cliente.nombre}
                          {' · '}
                          {evento.cantidadInvitados} invitados
                          {tipo ? ` · ${tipo.nombre}` : ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
