import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import EventoPill from './EventoPill'
import DayEventsPopover from './DayEventsPopover'
import DayEventsBottomSheet from './DayEventsBottomSheet'
import CalendarioLegend from './CalendarioLegend'
import FranjaDots from './FranjaDots'
import {
  getEventoFecha,
  getEventoId,
  getEventoTipoId,
} from '../../utils/eventos'

const MOBILE_BREAKPOINT = 768

function localDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function CalendarioEventos({
  eventos,
  tiposById,
  tipos,
  initialDate,
  onMonthChange,
  isAdmin = false,
}) {
  const [activeDay, setActiveDay] = useState(null)
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
  )
  const hoverTimerRef = useRef(null)
  const closeTimerRef = useRef(null)
  const cellCleanupRef = useRef({})
  const dotsRootsRef = useRef({})

  // Detect mobile resize
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const eventosByDate = useMemo(() => {
    const map = {}
    for (const e of eventos) {
      const fecha = getEventoFecha(e)
      if (!fecha) continue
      if (!map[fecha]) map[fecha] = []
      map[fecha].push(e)
    }
    return map
  }, [eventos])

  const fcEvents = useMemo(
    () =>
      eventos
        .map((e, index) => {
          const fecha = getEventoFecha(e)
          if (!fecha) return null
          return {
            id: String(getEventoId(e, `${fecha}-${index}`)),
            start: fecha,
            allDay: true,
            extendedProps: { evento: e },
          }
        })
        .filter(Boolean),
    [eventos],
  )

  function scheduleClose() {
    closeTimerRef.current = setTimeout(() => setActiveDay(null), 220)
  }

  function cancelClose() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  function openDay(fecha, rect) {
    cancelClose()
    if (eventosByDate[fecha]?.length) {
      setActiveDay({ fecha, rect })
    }
  }

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const dayCellDidMount = useCallback(
    (arg) => {
      const fecha = localDateStr(arg.date)
      const el = arg.el
      const dayEventos = eventosByDate[fecha]

      // Make cell position relative for FranjaDots absolute positioning
      el.style.position = 'relative'

      // Render FranjaDots into the cell
      if (dayEventos?.length) {
        el.setAttribute('tabindex', '0')
        el.style.cursor = 'pointer'

        const dotsContainer = document.createElement('div')
        el.appendChild(dotsContainer)
        const root = createRoot(dotsContainer)
        root.render(<FranjaDots eventos={dayEventos} />)
        dotsRootsRef.current[fecha] = { root, container: dotsContainer }
      }

      function onMouseEnter() {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = setTimeout(() => {
          openDay(fecha, el.getBoundingClientRect())
        }, 110)
      }

      function onMouseLeave() {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
        scheduleClose()
      }

      function onFocus() {
        openDay(fecha, el.getBoundingClientRect())
      }

      function onBlur() {
        scheduleClose()
      }

      function onKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openDay(fecha, el.getBoundingClientRect())
        }
      }

      // Mobile: tap to open
      function onClick() {
        if (window.innerWidth < MOBILE_BREAKPOINT) {
          openDay(fecha, el.getBoundingClientRect())
        }
      }

      el.addEventListener('mouseenter', onMouseEnter)
      el.addEventListener('mouseleave', onMouseLeave)
      el.addEventListener('focus', onFocus)
      el.addEventListener('blur', onBlur)
      el.addEventListener('keydown', onKeyDown)
      el.addEventListener('click', onClick)

      cellCleanupRef.current[fecha] = () => {
        el.removeEventListener('mouseenter', onMouseEnter)
        el.removeEventListener('mouseleave', onMouseLeave)
        el.removeEventListener('focus', onFocus)
        el.removeEventListener('blur', onBlur)
        el.removeEventListener('keydown', onKeyDown)
        el.removeEventListener('click', onClick)
      }
    },
    [eventosByDate], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const dayCellWillUnmount = useCallback((arg) => {
    const fecha = localDateStr(arg.date)

    // Cleanup FranjaDots React root
    const dotsEntry = dotsRootsRef.current[fecha]
    if (dotsEntry) {
      dotsEntry.root.unmount()
      dotsEntry.container.remove()
      delete dotsRootsRef.current[fecha]
    }

    if (cellCleanupRef.current[fecha]) {
      cellCleanupRef.current[fecha]()
      delete cellCleanupRef.current[fecha]
    }
  }, [])

  function handleEventClick(info) {
    info.jsEvent.preventDefault()
    info.jsEvent.stopPropagation()
    const evento = info.event.extendedProps.evento
    const fecha = getEventoFecha(evento)
    const cellEl = info.el.closest('.fc-daygrid-day')
    const rect = cellEl
      ? cellEl.getBoundingClientRect()
      : info.el.getBoundingClientRect()
    openDay(fecha, rect)
  }

  function handleMoreLinkClick(info) {
    info.jsEvent.preventDefault()
    const fecha = localDateStr(info.date)
    const cellEl = info.dayEl
    openDay(fecha, cellEl.getBoundingClientRect())
    return 'stop'
  }

  function handleDatesSet(info) {
    if (onMonthChange) {
      const d = info.view.currentStart
      onMonthChange(d.getFullYear(), d.getMonth() + 1)
    }
  }

  const activeDayEventos = activeDay
    ? (eventosByDate[activeDay.fecha] ?? [])
    : []

  const showPopover = activeDay && activeDayEventos.length > 0

  return (
    <div className="fc-eventos-wrapper salon404-fc-premium">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        initialDate={initialDate}
        locale="es"
        height="auto"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listMonth',
        }}
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          list: 'Agenda',
        }}
        events={fcEvents}
        dayMaxEventRows={3}
        moreLinkText={(n) => `+${n} más`}
        moreLinkClick={handleMoreLinkClick}
        eventContent={(arg) => {
          const evento = arg.event.extendedProps.evento
          const tipo = tiposById[getEventoTipoId(evento)]
          return <EventoPill evento={evento} tipo={tipo} isAdmin={isAdmin} />
        }}
        dayCellDidMount={dayCellDidMount}
        dayCellWillUnmount={dayCellWillUnmount}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
      />

      {/* Desktop: Popover flotante */}
      {showPopover && !isMobile && (
        <DayEventsPopover
          fecha={activeDay.fecha}
          eventos={activeDayEventos}
          tiposById={tiposById}
          anchorRect={activeDay.rect}
          onClose={() => setActiveDay(null)}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          isAdmin={isAdmin}
        />
      )}

      {/* Mobile: Bottom sheet */}
      {showPopover && isMobile && (
        <DayEventsBottomSheet
          fecha={activeDay.fecha}
          eventos={activeDayEventos}
          tiposById={tiposById}
          onClose={() => setActiveDay(null)}
          isAdmin={isAdmin}
        />
      )}

      <CalendarioLegend tipos={tipos} />
    </div>
  )
}
