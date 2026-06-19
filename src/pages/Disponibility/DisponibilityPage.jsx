import { useEffect, useState } from "react";
import CalendarView from "../../components/reservas/CalendarView";
import {
  getAvailability,
  getAllReservations,
} from "../../services/reservationService";
import Navbar from "../../components/global/Navbar";

export default function DisponibilityPage() {
  const [availableDays, setAvailableDays] = useState([]);
  const [notAvailableDays, setNotAvailableDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      setWarning(null);

      const [availableResult, reservationsResult] =
        await Promise.allSettled([
          getAvailability(),
          getAllReservations(),
        ]);

      if (reservationsResult.status === "fulfilled") {
        const reservations = Array.isArray(reservationsResult.value)
          ? reservationsResult.value
          : [];
        setNotAvailableDays(
          reservations.map(
            (r) => r.dateReserved
          ).filter(Boolean)
        );
      } else {
        console.error(reservationsResult.reason);
        setError(reservationsResult.reason?.message || "No se pudieron cargar las reservas.");
      }

      if (availableResult.status === "fulfilled") {
        setAvailableDays(Array.isArray(availableResult.value) ? availableResult.value : []);
      } else {
        console.error(availableResult.reason);
        setAvailableDays([]);
        setWarning(
          "No se pudo cargar la disponibilidad exacta. Se muestran las fechas reservadas disponibles."
        );
      }

      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Encabezado */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800">
            Disponibilidad de fechas
          </h1>

          <p className="mt-3 max-w-2xl text-lg text-slate-500">
            Consultá las fechas disponibles y
            reservá el día ideal para tu evento
            de manera rápida y sencilla.
          </p>
        </div>

        {/* Resumen */}
        {!loading && (
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Fechas disponibles
              </p>

              <div className="mt-3 flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-green-500" />

                <h2 className="text-4xl font-bold text-slate-800">
                  {availableDays.length}
                </h2>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Fechas reservadas
              </p>

              <div className="mt-3 flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-red-500" />

                <h2 className="text-4xl font-bold text-slate-800">
                  {notAvailableDays.length}
                </h2>
              </div>
            </div>
          </div>
        )}

        {/* Calendario */}
        <div className="rounded-[2rem] bg-white p-6 shadow-lg md:p-8">
          {loading ? (
            <div className="flex h-96 flex-col items-center justify-center gap-5">
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />

              <p className="text-slate-500">
                Cargando disponibilidad...
              </p>
            </div>
          ) : error ? (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-center">
              <p className="text-lg font-semibold text-slate-800">
                No se pudo cargar la disponibilidad
              </p>
              <p className="max-w-md text-sm text-slate-500">
                {error}
              </p>
            </div>
          ) : (
            <>
              {warning && (
                <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {warning}
                </div>
              )}
              <CalendarView
                fechasDisponibles={
                  availableDays
                }
                fechasReservadas={
                  notAvailableDays
                }
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
