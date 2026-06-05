import { useNavigate } from "react-router-dom";
import Navbar from "../../components/global/Navbar";

export default function HomePage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
     <Navbar/>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="mb-4 text-5xl font-bold text-slate-800">
          Hacé de tu evento un momento inolvidable
        </h2>

        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          Organizamos casamientos, fiestas de XV,
          eventos corporativos y celebraciones privadas
          en un espacio moderno y adaptable.
        </p>

        <button className="rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700">
          Ver disponibilidad
        </button>
      </section>

      {/* Eventos */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h3 className="mb-8 text-center text-3xl font-bold">
          Nuestros eventos
        </h3>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow">
            <h4 className="text-xl font-semibold"> Casamientos</h4>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h4 className="text-xl font-semibold"> XV Años</h4>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h4 className="text-xl font-semibold"> Corporativos</h4>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h4 className="text-xl font-semibold"> Otros</h4>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16 text-center text-white">
        <h3 className="mb-4 text-3xl font-bold">
          ¿Listo para reservar tu fecha?
        </h3>

        <p className="mb-6">
          Registrate y consultá disponibilidad en tiempo real.
        </p>

        <button className="rounded-lg bg-white px-6 py-3 font-medium text-indigo-600">
          Crear cuenta
        </button>
      </section>
    </div>
  );
}