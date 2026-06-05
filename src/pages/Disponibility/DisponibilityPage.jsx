import { useEffect, useMemo, useState } from "react";
import CalendarView from "../../components/reservas/CalendarView";
import { getAvailability,getAllReservations} from "../../services/reservationService";
import Navbar from "../../components/global/Navbar";

export default function DisponibilityPage() {
  const [availableDays, setAvailableDays] = useState([]);
  const [notAvailableDays,setNotAvailableDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function load() {
    setLoading(true);

    try {
      const [available, reservations] = await Promise.all([
        getAvailability(),
        getAllReservations(),
      ]);

      setAvailableDays(available);
      setNotAvailableDays(reservations.map(r => r.dateReserved));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  load();
}, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Días disponibles
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Seleccioná una fecha para crear una reserva
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          {loading ? (
            <div className="text-slate-500 text-sm">
              Cargando calendario...
            </div>
          ) : (
            <CalendarView fechasDisponibles={availableDays} fechasReservadas={notAvailableDays} />
          )}
        </div>
      </div>
    </div>
  );
}