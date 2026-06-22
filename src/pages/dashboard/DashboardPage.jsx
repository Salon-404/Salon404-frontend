import { useState } from "react";
import { useNavigate } from "react-router-dom";
//Componete de cada opcion del menu de dashboard
import Metricas from "../../components/dashboard/Metricas";

export default function DashboardPage() {
  const navigate = useNavigate();

  // Modifica este estado según la sección activa que decidas crear
  const [seccion, setSeccion] = useState("Inicio");

  return (
    <div className="min-h-screen bg-[#E6F1FB]">
      {/* HEADER */}
      <div className="bg-[#0C447C]">
        <div className="max-w-7xl mx-auto px-10 py-10">
          <button
            onClick={() => navigate("/")}
            className="text-[#85B7EB] text-sm mb-6 hover:underline block"
          >
            &larr; Ir a la Pagina Principal
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-semibold text-white mt-2">
                {"Panel del administrador"}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-10 py-10">
        <div className="grid grid-cols-[260px_1fr] gap-8">
          {/* SIDEBAR DE ADMINISTRACIÓN */}
          <aside className="bg-white rounded-3xl shadow-sm p-5 h-fit">
            <h2 className="text-[#0C447C] font-semibold mb-4 px-2">
              Menu del administrador
            </h2>
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => setSeccion("Visualizacion de metricas")}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === "Visualizacion de metricas"
                    ? "bg-[#185FA5] text-white font-medium"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Visualizacion de metricas
              </button>

              <button
                onClick={() => setSeccion("Gestion de eventos")}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === "Gestion de eventos"
                    ? "bg-[#185FA5] text-white font-medium"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Gestion de eventos
              </button>

              <button
                onClick={() => setSeccion("Gestion de salones")}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === "Gestion de salones"
                    ? "bg-[#185FA5] text-white font-medium"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Gestion de salones
              </button>

              <button
                onClick={() => setSeccion("Gestion del calendario")}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === "Gestion del calendario"
                    ? "bg-[#185FA5] text-white font-medium"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Gestion del calendario
              </button>

              <button
                onClick={() => setSeccion("Gestion de proveedores")}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === "Gestion de proveedores"
                    ? "bg-[#185FA5] text-white font-medium"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Gestion de proveedores
              </button>

              <button
                onClick={() => setSeccion("Gestion del catering")}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === "Gestion del catering"
                    ? "bg-[#185FA5] text-white font-medium"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Gestion del catering
              </button>
            </nav>
          </aside>

          {/* ÁREA DE CONTENIDO */}
          <main>
            {/* PANEL CENTRAL DINÁMICO */}
            <div className="bg-white rounded-3xl p-8 shadow-sm min-h-[400px]">
              {seccion === "Inicio" && (
                <div>
                  <h2 className="text-2xl font-semibold text-[#0C447C] mb-4">
                    Bienvenido al Panel del administrador
                  </h2>
                  <p className="text-slate-600">
                    Selecciona una sección que desea visualizar en la barra
                    lateral para empezar a trabajar.
                  </p>
                </div>
              )}

              {seccion === "Visualizacion de metricas" && <Metricas />}

              {seccion === "Gestion de eventos" && (
                <div>
                  <h2 className="text-2xl font-semibold text-[#0C447C]">
                    Eventos
                  </h2>
                </div>
              )}

              {seccion === "Gestion de salones" && (
                <div>
                  <h2 className="text-2xl font-semibold text-[#0C447C]">
                    Salones
                  </h2>
                </div>
              )}

              {seccion === "Gestion del calendario" && (
                <div>
                  <h2 className="text-2xl font-semibold text-[#0C447C]">
                    Calendario
                  </h2>
                </div>
              )}
              {seccion === "Gestion de proveedores" && (
                <div>
                  <h2 className="text-2xl font-semibold text-[#0C447C]">
                    Proveedores
                  </h2>
                </div>
              )}

              {seccion === "Gestion del catering" && (
                <div>
                  <h2 className="text-2xl font-semibold text-[#0C447C]">
                    Catering
                  </h2>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
