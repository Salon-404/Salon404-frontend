import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function CalendarView({
  fechasDisponibles = [],
  fechasReservadas = [],
  initialDate,
}) {
  const navigate = useNavigate();

  const disponiblesSet = useMemo(
    () => new Set(fechasDisponibles),
    [fechasDisponibles]
  );

  const reservadasSet = useMemo(
    () => new Set(fechasReservadas),
    [fechasReservadas]
  );

  const proximaFechaDisponible = useMemo(() => {
    const hoy = new Date().toISOString().split("T")[0];

    return [...fechasDisponibles]
      .filter((fecha) => fecha >= hoy)
      .sort()[0];
  }, [fechasDisponibles]);

  function handleDateClick(info) {
    const dateStr = info.dateStr;

    if (!disponiblesSet.has(dateStr)) return;

    navigate(`/reservas/nueva?fecha=${dateStr}`);
  }

  function irAProximaFecha() {
    if (!proximaFechaDisponible) return;

    navigate(
      `/reservas/nueva?fecha=${proximaFechaDisponible}`
    );
  }

  function dayCellClassNames(arg) {
    const dateStr =
      arg.date.toISOString().split("T")[0];

    if (reservadasSet.has(dateStr)) {
      return ["fc-day-occupied"];
    }

    if (disponiblesSet.has(dateStr)) {
      return ["fc-day-available"];
    }

    return ["fc-day-unavailable"];
  }

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">
            Calendario de reservas
          </h2>

          <p className="mt-3 max-w-2xl text-slate-500">
            Seleccioná una fecha marcada en verde
            para iniciar una nueva reserva.
          </p>
        </div>

        <button
          onClick={irAProximaFecha}
          disabled={!proximaFechaDisponible}
          className="
            rounded-2xl
            bg-indigo-600
            px-6
            py-4
            font-semibold
            text-white
            shadow-md
            transition-all
            hover:-translate-y-1
            hover:bg-indigo-700
            hover:shadow-lg
            disabled:cursor-not-allowed
            disabled:bg-slate-300
            disabled:shadow-none
          "
        >
           Próxima fecha disponible
        </button>
      </div>

      {/* Leyenda */}
      <div className="mb-8 flex flex-wrap gap-5 rounded-3xl bg-slate-50 p-5">
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="font-medium text-slate-700">
            Disponible
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="font-medium text-slate-700">
            Reservado
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
          <span className="h-3 w-3 rounded-full bg-slate-300" />
          <span className="font-medium text-slate-700">
            Sin disponibilidad
          </span>
        </div>
      </div>

      {/* Calendario */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
        <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={initialDate}
        locale="es"
        dateClick={handleDateClick}
        dayCellClassNames={dayCellClassNames}
        height="auto"
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "today",
        }}
        buttonText={{
          today: "Hoy",
          prev: "←",
          next: "→",
        }}
      />
      </div>
    </div>
  );
}