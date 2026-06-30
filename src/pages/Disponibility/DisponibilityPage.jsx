import { useEffect, useState } from "react";
import CalendarView from "../../components/reservas/CalendarView";
import { getSalonsName, getSalonAvailable } from "../../services/salonService";
import Navbar from "../../components/global/Navbar";

export default function DisponibilityPage() {
  const [availableDays, setAvailableDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSalonId, setSelectedSalonId] = useState(null);
  const [salonsNames, setSalonsNames] = useState([]);
  const [warning, setWarning] = useState(null);

  useEffect(() => {
    async function loadSalons() {
      try {
        const salons = await getSalonsName();
        setSalonsNames(Array.isArray(salons) ? salons : []);
      } catch (err) {
        console.error(err);
        setSalonsNames([]);
      }
    }

    loadSalons();
  }, []);

 
  useEffect(() => {
    if (!selectedSalonId) {
      setAvailableDays([]);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await getSalonAvailable(selectedSalonId);
        setAvailableDays(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la disponibilidad");
        setAvailableDays([]);
      }

      setLoading(false);
    }

    load();
  }, [selectedSalonId]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800">
            Disponibilidad de fechas
          </h1>

          <p className="mt-3 max-w-2xl text-lg text-slate-500">
            Consultá las fechas disponibles según el salón seleccionado.
          </p>
        </div>

        {/* SELECT SALÓN */}
        <div className="mb-6">
          <label className="text-sm font-medium text-slate-600">
            Seleccioná un salón
          </label>

          <select
            className="mt-2 w-full rounded-xl border p-3"
            value={selectedSalonId || ""}
            onChange={(e) => setSelectedSalonId(e.target.value)}
          >
            <option value="">Elegí un salón</option>

            {salonsNames.map((salon) => (
              <option key={salon.salonId} value={salon.salonId}>
                {salon.salonName}
              </option>
            ))}
          </select>
        </div>

        {/* CALENDARIO */}
        <div className="rounded-[2rem] bg-white p-6 shadow-lg md:p-8">

          {/* SIN SALÓN */}
          {!selectedSalonId ? (
            <div className="flex h-96 flex-col items-center justify-center text-center">
              <p className="text-lg font-semibold text-slate-800">
                Seleccioná un salón
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Para ver la disponibilidad del calendario
              </p>
            </div>

          ) : loading ? (
            /* LOADING */
            <div className="flex h-96 flex-col items-center justify-center gap-5">
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              <p className="text-slate-500">
                Cargando disponibilidad...
              </p>
            </div>

          ) : error ? (
            /* ERROR */
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-center">
              <p className="text-lg font-semibold text-slate-800">
                No se pudo cargar la disponibilidad
              </p>
              <p className="max-w-md text-sm text-slate-500">
                {error}
              </p>
            </div>

          ) : (
            /*  CALENDARIO */
            <>
              {warning && (
                <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {warning}
                </div>
              )}

              <CalendarView fechasDisponibles={availableDays} salonId={selectedSalonId} />
            </>
          )}

        </div>
      </main>
    </div>
  );
}