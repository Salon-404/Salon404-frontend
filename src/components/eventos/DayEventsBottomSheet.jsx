import { useEffect, useRef } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import PopoverContent from './PopoverContent'
import { useReducedMotion } from '../../hooks/useReducedMotion'

function formatFechaLabel(fecha) {
  try {
    const raw = format(parseISO(fecha), "EEEE d 'de' MMMM", { locale: es })
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  } catch {
    return fecha
  }
}

export default function DayEventsBottomSheet({
  fecha,
  eventos,
  tiposById,
  onClose,
  isAdmin = false,
}) {
  const sheetRef = useRef(null)
  const reducedMotion = useReducedMotion()

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Close on overlay click
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  if (!eventos || eventos.length === 0) return null

  const fechaLabel = formatFechaLabel(fecha)
  const animStyle = reducedMotion ? {} : undefined

  return (
    <>
      {/* Overlay */}
      <div
        className="salon404-bottom-sheet-overlay"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Eventos del ${fechaLabel}`}
        className="salon404-bottom-sheet"
        style={animStyle}
      >
        {/* Drag handle */}
        <div className="salon404-bottom-sheet-handle" aria-hidden="true" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">{fechaLabel}</span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
              {eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="day-popover-scroll overflow-y-auto flex-1 px-3 py-2 pb-6">
          <PopoverContent eventos={eventos} tiposById={tiposById} isAdmin={isAdmin} />
        </div>
      </div>
    </>
  )
}
