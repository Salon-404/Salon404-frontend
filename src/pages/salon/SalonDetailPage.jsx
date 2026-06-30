import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/global/Navbar'
import { getSalons } from '../../services/salonService'
import SalonCarousel from '../../components/salon/salonCarousel'
import InfoCard from '../../components/salon/InfoCard'
import StatusBadge from '../../components/salon/StatusBadge'


function SalonImage({ salon }) {
  if (salon.profilePicture) {
    return (
      <img
        src={salon.profilePicture}
        alt={salon.salonName}
        className="h-80 w-full object-cover"
      />
    )
  }

  return (
    <div className="flex h-80 w-full items-center justify-center bg-slate-200">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-indigo-600 shadow-sm">
          404
        </div>
        <p className="text-sm font-medium text-slate-500">Imagen no disponible</p>
      </div>
    </div>
  )
}

export default function SalonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const salones = await getSalons();

        const encontrado = salones.find(
          (item) => String(item.salonId ?? item.id) === String(id)
        );

        if (!cancelled) {
          if (encontrado) {
            setSalon(encontrado);
          } else {
            setError("No se encontró el salón.");
          }
        }
      } catch {
        if (!cancelled) {
          setError("No fue posible cargar la información.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-slate-100">
        <Navbar />

        <div className="mx-auto flex h-[70vh] max-w-6xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />

            <h2 className="text-2xl font-bold text-slate-700">
              Cargando salón...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-slate-100">
        <Navbar />

        <div className="mx-auto max-w-xl py-24">
          <div className="rounded-3xl border border-red-200 bg-white p-10 text-center shadow">
            <h2 className="mb-3 text-2xl font-bold text-red-600">
              Ocurrió un error
            </h2>

            <p className="text-slate-500">{error}</p>

            <button
              onClick={() => navigate("/salones")}
              className="mt-8 rounded-xl bg-amber-500 px-8 py-3 font-semibold text-white transition hover:bg-amber-600"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }
  function formatTime(time) {
  if (!time) return "-";

  return time.substring(0, 5);
}

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">

        <div className="overflow-hidden rounded-[32px] bg-white shadow-2xl">

          <SalonCarousel salon={salon} />

          <div className="p-10">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">

              <div>

                <StatusBadge status={salon.status} />

                <h1 className="mt-5 text-5xl font-black text-slate-800">
                  {salon.salonName}
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                  {salon.description}
                </p>

                <div className="mt-8 flex items-center gap-3 text-lg text-slate-500">

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>

                  {salon.address}
                </div>
              </div>

              <div className="flex flex-col gap-4">

                <button
                  onClick={() =>
                    navigate(`/disponibilidad`)
                  }
                  className="rounded-2xl bg-indigo-600 px-10 py-4 text-lg font-bold text-white shadow-lg transition  hover:bg-indigo-700"
                >
                  Reservar ahora
                </button>

                <button
                  onClick={() => navigate("/salones")}
                  className="rounded-2xl border border-slate-300 bg-white px-10 py-4 font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Volver
                </button>

              </div>

            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              <InfoCard
                titulo="Capacidad"
                valor={`${salon.maxCap} personas`}
              />

              <InfoCard
                titulo="Horario"
                valor={`${formatTime(salon.startTime)} - ${formatTime(
                  salon.endTime
                )}`}
                
              />

              <InfoCard
                titulo="Tiempo de limpieza"
                valor={`${salon.cleaningTime} minutos`}
                
              />

              <InfoCard
                titulo="Estado"
                valor={salon.status}
             
              />

            </div>

            <section className="mt-16">

              <h2 className="mb-6 text-3xl font-bold text-slate-800">
                Sobre este salón
              </h2>

              <div className="rounded-3xl bg-slate-50 p-8 leading-8 text-slate-600">

                {salon.description ||
                  "Este salón no posee una descripción cargada."}

              </div>

            </section>

            {salon.salonDiagram && (

              <section className="mt-16">

                <h2 className="mb-6 text-3xl font-bold text-slate-800">
                  Plano del salón
                </h2>

                <div className="overflow-hidden rounded-3xl border bg-white shadow-lg">

                <img
                  src={salon.salonDiagram}
                  alt="Plano del salón"
                  className="mx-auto w-full max-w-3xl rounded-2xl object-cover"
                />

                </div>

              </section>

            )}

          </div>

        </div>

      </main>

    </div>
  );
}
