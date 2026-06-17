import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/global/Navbar";
import { getSalons } from "../../services/salonService";

export default function SalonesPage() {
  const navigate = useNavigate();

  const [salones, setSalones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarSalones = async () => {
      try {
        const data = await getSalons();
        setSalones(data);
      } catch (error) {
        console.error("Error al cargar salones:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarSalones();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h1 className="mb-4 text-5xl font-bold text-slate-800">
          Nuestros Salones
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Encontrá el espacio ideal para tu evento. Disponemos de salones
          modernos, cómodos y adaptables para cualquier tipo de celebración.
        </p>
      </section>

      {/* Lista de salones */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        {loading ? (
          <p className="text-center text-slate-500">
            Cargando salones...
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {salones.map((salon) => (
              <div
                key={salon.salonId}
                className="overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={salon.profilePicture}
                  alt={salon.salonName}
                  className="h-56 w-full object-cover"
                />

                <div className="p-6">
                  <h2 className="mb-2 text-2xl font-bold text-slate-800">
                    {salon.salonName}
                  </h2>

                  <p className="mb-3 text-slate-600">
                    {salon.description}
                  </p>

                  <p className="mb-6 text-sm text-slate-500">
                    Capacidad para {salon.maxCap} personas
                  </p>

                  <button
                    onClick={() => navigate(`/salones/${salon.id}`)}
                    className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-700"
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}