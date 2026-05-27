import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useNavigate } from 'react-router-dom'
import { CALENDARIO_BG, CALENDARIO_COLORES } from '../../constants/reservas'

export default function CalendarView({ fechasOcupadas = [], fechasPendientes = [], initialDate, onMonthChange }) {
  const navigate = useNavigate()

  const eventos = [
    ...fechasOcupadas.map((fecha) => ({
      title: 'Ocupado',
      date: fecha,
      backgroundColor: CALENDARIO_BG.confirmada,
      borderColor: CALENDARIO_COLORES.confirmada,
      textColor: CALENDARIO_COLORES.confirmada,
      extendedProps: { estado: 'confirmada' },
    })),
    ...fechasPendientes.map((fecha) => ({
      title: 'Pendiente',
      date: fecha,
      backgroundColor: CALENDARIO_BG.pendiente,
      borderColor: CALENDARIO_COLORES.pendiente,
      textColor: CALENDARIO_COLORES.pendiente,
      extendedProps: { estado: 'pendiente' },
    })),
  ]

  const fechasOcupadasSet = new Set([...fechasOcupadas, ...fechasPendientes])

  function handleDateClick(info) {
    if (fechasOcupadasSet.has(info.dateStr)) return
    navigate(`/reservas/nueva?fecha=${info.dateStr}`)
  }

  function dayCellClassNames(arg) {
    const dateStr = arg.date.toISOString().split('T')[0]
    if (fechasOcupadas.includes(dateStr)) return ['fc-day-occupied']
    if (fechasPendientes.includes(dateStr)) return ['fc-day-pending']
    return ['fc-day-available']
  }

  return (
    <div className="fc-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={initialDate}
        locale="es"
        buttonText={{ today: 'Hoy', month: 'Mes' }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
        events={eventos}
        dateClick={handleDateClick}
        dayCellClassNames={dayCellClassNames}
        datesSet={(info) => {
          if (onMonthChange) {
            const d = info.view.currentStart
            onMonthChange(d.getFullYear(), d.getMonth() + 1)
          }
        }}
        height="auto"
      />

      <div className="flex gap-6 mt-4 text-sm text-slate-600">
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: CALENDARIO_BG.confirmada, border: `1px solid ${CALENDARIO_COLORES.confirmada}` }} />
          Ocupado (confirmada)
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: CALENDARIO_BG.pendiente, border: `1px solid ${CALENDARIO_COLORES.pendiente}` }} />
          Pendiente
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded bg-white border border-slate-300" />
          Disponible
        </span>
      </div>
    </div>
  )
}
