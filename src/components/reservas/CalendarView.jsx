import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useNavigate } from 'react-router-dom'

export default function CalendarView({
  fechasDisponibles = [],
  fechasReservadas = [],
  initialDate,
}) {
  const navigate = useNavigate()

  const disponiblesSet = new Set(fechasDisponibles)
  const reservadasSet = new Set(fechasReservadas)

  function handleDateClick(info) {
    const dateStr = info.dateStr

    if (!disponiblesSet.has(dateStr)) return

    navigate(`/reservas/nueva?fecha=${dateStr}`)
  }

  function dayCellClassNames(arg) {
    const dateStr = arg.date.toISOString().split('T')[0]

    if (reservadasSet.has(dateStr)) {
      return ['fc-day-occupied']
    }

    if (disponiblesSet.has(dateStr)) {
      return ['fc-day-available']
    }

    return ['fc-day-unavailable']
  }

  const eventos = [
    ...fechasDisponibles.map((fecha) => ({
      title: 'Disponible',
      date: fecha,
      backgroundColor: '#22c55e',
      borderColor: '#16a34a',
    })),
    ...fechasReservadas.map((fecha) => ({
      title: 'Ocupado',
      date: fecha,
      backgroundColor: '#ef4444',
      borderColor: '#dc2626',
    })),
  ]

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      initialDate={initialDate}
      locale="es"
      events={eventos}
      dateClick={handleDateClick}
      dayCellClassNames={dayCellClassNames}
      height="auto"
    />
  )
}