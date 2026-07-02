import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { esAdmin } from "../../utils/seguridad";

export default function CalendarView({ fechasOcupadas = [], eventos = [], salonId }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const adminMode = esAdmin(user);
  const [modal, setModal] = useState(null);

  const eventosPorFecha = useMemo(() => {
    const map = {};
    eventos.forEach((ev) => {
      const fecha = ev.eventDate;
      if (!map[fecha]) map[fecha] = [];
      map[fecha].push(ev);
    });
    return map;
  }, [eventos]);

  const ocupadasSet = useMemo(() => new Set(fechasOcupadas), [fechasOcupadas]);

  const proximaFechaDisponible = useMemo(() => {
    const hoy = new Date();
    const fechaLimite = new Date(hoy);
    fechaLimite.setMonth(fechaLimite.getMonth() + 1);
    const candidatas = [];
    for (let d = new Date(hoy); d <= fechaLimite; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const str = `${year}-${month}-${day}`;
      if (!ocupadasSet.has(str)) candidatas.push(str);
    }
    return candidatas[0];
  }, [fechasOcupadas]);

  function formatHora(timespan) {
    if (!timespan) return "";
    return timespan.substring(0, 5);
  }

  function handleDateClick(info) {
    const dateStr = info.dateStr;
    const hoy = new Date();
    const hoyYear = hoy.getFullYear();
    const hoyMonth = String(hoy.getMonth() + 1).padStart(2, "0");
    const hoyDay = String(hoy.getDate()).padStart(2, "0");
    const hoyStr = `${hoyYear}-${hoyMonth}-${hoyDay}`;
    const fechaLimite = new Date(hoy);
    fechaLimite.setMonth(fechaLimite.getMonth() + 1);
    const limYear = fechaLimite.getFullYear();
    const limMonth = String(fechaLimite.getMonth() + 1).padStart(2, "0");
    const limDay = String(fechaLimite.getDate()).padStart(2, "0");
    const fechaLimiteStr = `${limYear}-${limMonth}-${limDay}`;
    if (dateStr < hoyStr || dateStr > fechaLimiteStr) return;
    const eventosEnFecha = eventosPorFecha[dateStr] || [];
    if (adminMode) {
      setModal({ fecha: dateStr, eventos: eventosEnFecha });
      return;
    }
    if (eventosEnFecha.length === 0) {
      navigate(`/eventos/nuevo?fecha=${dateStr}&salonId=${salonId}`);
      return;
    }
    const turnoManana = eventosEnFecha.find(e => e.eventStart && e.eventStart <= "12:00:00");
    const turnoTarde = eventosEnFecha.find(e => e.eventStart && e.eventStart > "12:00:00");
    if (turnoManana && turnoTarde) {
      setModal({ fecha: dateStr, eventos: eventosEnFecha, sinDisponibilidad: true });
      return;
    }
    setModal({ fecha: dateStr, eventos: eventosEnFecha, turnoLibre: true });
  }

  function irAProximaFecha() {
    if (!proximaFechaDisponible) return;
    navigate(`/eventos/nuevo?fecha=${proximaFechaDisponible}&salonId=${salonId}`);
  }

 function dayCellClassNames(arg) {
  const year = arg.date.getFullYear();
  const month = String(arg.date.getMonth() + 1).padStart(2, "0");
  const day = String(arg.date.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}-${String(hoy.getDate()).padStart(2,"0")}`;
  const fechaLimite = new Date(hoy);
  fechaLimite.setMonth(fechaLimite.getMonth() + 1);
  const limStr = `${fechaLimite.getFullYear()}-${String(fechaLimite.getMonth()+1).padStart(2,"0")}-${String(fechaLimite.getDate()).padStart(2,"0")}`;

  if (dateStr < hoyStr || dateStr > limStr) return ["fc-day-disabled"];
  if (eventosPorFecha[dateStr]?.length > 0) return ["fc-day-unavailable"];
  return ["fc-day-available"];
}

  return (
    <div>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">📅 {modal.fecha}</h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            {adminMode && modal.eventos.length === 0 && (
              <p className="text-slate-500">Sin eventos reservados para esta fecha.</p>
            )}
            {adminMode && modal.eventos.length > 0 && (
              <div className="flex flex-col gap-3">
                {modal.eventos.map((ev) => (
                  <button
                    key={ev.eventId}
                    onClick={() => { navigate(`/eventos/${ev.eventId}`); setModal(null); }}
                    className="rounded-xl border border-slate-200 p-4 text-left hover:bg-indigo-50 transition"
                  >
                    <p className="font-semibold text-slate-800">{ev.eventName}</p>
                    <p className="text-sm text-slate-500">{formatHora(ev.eventStart)} - {formatHora(ev.eventFinish)}</p>
                  </button>
                ))}
              </div>
            )}
            {!adminMode && modal.sinDisponibilidad && (
              <p className="text-slate-500">No quedan horarios disponibles para esta fecha. Por favor elegí otra.</p>
            )}
            {!adminMode && modal.turnoLibre && (
              <div>
                <p className="mb-4 text-slate-600">Un turno está ocupado. ¿Querés reservar el turno disponible?</p>
                <button
                  onClick={() => { navigate(`/eventos/nuevo?fecha=${modal.fecha}&salonId=${salonId}`); setModal(null); }}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700"
                >
                  Reservar turno disponible
                </button>
              </div>
            )}
            <button onClick={() => setModal(null)} className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50">
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Calendario de reservas</h2>
          <p className="mt-3 max-w-2xl text-slate-500">
            Seleccioná una fecha marcada en verde para iniciar una nueva reserva.
          </p>
        </div>
        <button
          onClick={irAProximaFecha}
          disabled={!proximaFechaDisponible || adminMode}
          className="rounded-2xl bg-indigo-600 px-6 py-4 font-semibold text-white shadow-md transition-all hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          Próxima fecha disponible
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-5 rounded-3xl bg-slate-50 p-5">
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="font-medium text-slate-700">Disponible</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="font-medium text-slate-700">Sin disponibilidad</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
        <FullCalendar
        key={fechasOcupadas.join(",")}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="es"
          dateClick={handleDateClick}
          dayCellClassNames={dayCellClassNames}
          height="auto"
          headerToolbar={{ left: "prev,next", center: "title", right: "today" }}
          buttonText={{ today: "Hoy", prev: "←", next: "→" }}
        />
      </div>
    </div>
  );
}