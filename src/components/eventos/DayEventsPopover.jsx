import { useEffect, useState, useRef } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import PopoverContent from './PopoverContent'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const POPOVER_WIDTH = 320
const POPOVER_DEFAULT_HEIGHT = 420
const VIEWPORT_MARGIN = 8

function calcPosition(anchorRect, popoverWidth, popoverHeight) {
  const vw = window.innerWidth
  const vh = window.innerHeight

  let left = anchorRect.right + VIEWPORT_MARGIN
  let top = anchorRect.top

  if (left + popoverWidth > vw - VIEWPORT_MARGIN) {
    left = anchorRect.left - popoverWidth - VIEWPORT_MARGIN
  }
  left = Math.max(VIEWPORT_MARGIN, Math.min(left, vw - popoverWidth - VIEWPORT_MARGIN))

  if (top + popoverHeight > vh - VIEWPORT_MARGIN) {
    top = vh - popoverHeight - VIEWPORT_MARGIN
  }
  top = Math.max(VIEWPORT_MARGIN, top)

  return { left, top }
}

function formatFechaLabel(fecha) {
  try {
    const raw = format(parseISO(fecha), "EEEE d 'de' MMMM", { locale: es })
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  } catch {
    return fecha
  }
}

export default function DayEventsPopover({
  fecha,
  eventos,
  tiposById,
  anchorRect,
  onClose,
  onMouseEnter,
  onMouseLeave,
  isAdmin = false,
}) {
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState({ left: 0, top: 0 })
  const popoverRef = useRef(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!anchorRect) return
    const popH = popoverRef.current?.offsetHeight ?? POPOVER_DEFAULT_HEIGHT
    setPos(calcPosition(anchorRect, POPOVER_WIDTH, popH))
  }, [anchorRect])

  useEffect(() => {
    if (mounted && popoverRef.current && anchorRect) {
      setPos(calcPosition(anchorRect, POPOVER_WIDTH, popoverRef.current.offsetHeight))
    }
  }, [mounted, anchorRect])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Click outside to close
  useEffect(() => {
    function onClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose()
      }
    }
    // Delay to avoid triggering on the same click that opened it
    const timerId = setTimeout(() => {
      document.addEventListener('mousedown', onClickOutside)
    }, 50)
    return () => {
      clearTimeout(timerId)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [onClose])

  if (!eventos || eventos.length === 0) return null

  const fechaLabel = formatFechaLabel(fecha)
  const transitionClass = reducedMotion
    ? ''
    : `transition-all duration-200 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="false"
      aria-label={`Eventos del ${fechaLabel}`}
      className={`day-popover fixed z-50 w-80 rounded-xl border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-xl ${transitionClass}`}
      style={{
        left: pos.left,
        top: pos.top,
        maxHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
      }}
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

      {/* Body */}
      <div className="day-popover-scroll overflow-y-auto flex-1 px-3 py-2">
        <PopoverContent eventos={eventos} tiposById={tiposById} isAdmin={isAdmin} />
      </div>
    </div>
  )
}
