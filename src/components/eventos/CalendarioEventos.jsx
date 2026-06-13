import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import EventoPill from './EventoPill'
import DayEventsPopover from './DayEventsPopover'
import CalendarioLegend from './CalendarioLegend'

// Formatea Date local como 'YYYY-MM-DD' sin conversión UTC (evita shift por timezone).
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
}) {
  const [activeDay, setActiveDay] = useState(null) // { fecha, rect }
  const hoverTimerRef = useRef(null)
  const closeTimerRef = useRef(null)
  // Mapa de cleanup por celda: fecha → función cleanup
  const cellCleanupRef = useRef({})

  // Mapa fecha → Evento[] para lookup rápido
  const eventosByDate = useMemo(() => {
    const map = {}
    for (const e of eventos) {
      if (!map[e.fecha]) map[e.fecha] = []
      map[e.fecha].push(e)
    }
    return map
  }, [eventos])

  // Mapeo a eventos de FullCalendar (single-day allDay para evitar spans nocturnos)
  const fcEvents = useMemo(
    () =>
      eventos.map((e) => ({
        id: e.id,
        start: e.fecha,
        allDay: true,
        extendedProps: { evento: e },
      })),
    [eventos],
  )

  function scheduleClose() {
    closeTimerRef.current = setTimeout(() => {
      setActiveDay(null)
    }, 220)
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

  // Cleanup de timers al desmontar
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  // Attach hover + focus listeners a cada celda
  const dayCellDidMount = useCallback(
    (arg) => {
      const fecha = localDateStr(arg.date)
      const el = arg.el

      // Accesibilidad: celda focusable si tiene eventos
      if (eventosByDate[fecha]?.length) {
        el.setAttribute('tabindex', '0')
        el.style.cursor = 'pointer'
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

      el.addEventListener('mouseenter', onMouseEnter)
      el.addEventListener('mouseleave', onMouseLeave)
      el.addEventListener('focus', onFocus)
      el.addEventListener('blur', onBlur)
      el.addEventListener('keydown', onKeyDown)

      // Guardar cleanup por fecha para el dayCellWillUnmount
      cellCleanupRef.current[fecha] = () => {
        el.removeEventListener('mouseenter', onMouseEnter)
        el.removeEventListener('mouseleave', onMouseLeave)
        el.removeEventListener('focus', onFocus)
        el.removeEventListener('blur', onBlur)
        el.removeEventListener('keydown', onKeyDown)
      }
    },
    [eventosByDate], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const dayCellWillUnmount = useCallback((arg) => {
    const fecha = localDateStr(arg.date)
    if (cellCleanupRef.current[fecha]) {
      cellCleanupRef.current[fecha]()
      delete cellCleanupRef.current[fecha]
    }
  }, [])

  function handleEventClick(info) {
    info.jsEvent.preventDefault()
    const evento = info.event.extendedProps.evento
    const cellEl = info.el.closest('.fc-daygrid-day')
    const rect = cellEl ? cellEl.getBoundingClientRect() : info.el.getBoundingClientRect()
    openDay(evento.fecha, rect)
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

  const activeDayEventos = activeDay ? (eventosByDate[activeDay.fecha] ?? []) : []

  return (
    <div className="fc-eventos-wrapper">
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
          const tipo = tiposById[evento.tipoEventoId]
          return <EventoPill evento={evento} tipo={tipo} />
        }}
        dayCellDidMount={dayCellDidMount}
        dayCellWillUnmount={dayCellWillUnmount}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
      />

      {/* Popover flotante */}
      {activeDay && activeDayEventos.length > 0 && (
        <DayEventsPopover
          fecha={activeDay.fecha}
          eventos={activeDayEventos}
          tiposById={tiposById}
          anchorRect={activeDay.rect}
          onClose={() => setActiveDay(null)}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        />
      )}

      <CalendarioLegend tipos={tipos} />
    </div>
  )
}
