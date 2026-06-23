import { useEffect, useState } from "react";
import { getSalons } from "../../services/salonService";

export default function Salones() {
  const [salones, setSalones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para controlar la paginación según tu Swagger
  const [paginaActual, setPaginaActual] = useState(1);
  const [tamanoPagina] = useState(10); // Traemos de a 10 elementos por página

  useEffect(() => {
    async function obtenerSalones() {
      try {
        setCargando(true);
        const res = await getSalons({
          page: paginaActual,
          size: tamanoPagina,
        });

        // REVISIÓN CRÍTICA: Desestructuramos o validamos si la API devuelve un objeto paginado
        const listaSalones = Array.isArray(res)
          ? res
          : res?.data || res?.items || res?.results || [];

        setSalones(listaSalones);
      } catch (error) {
        console.error("Error al cargar los salones paginados:", error);
        setSalones([]); // Evitamos que quede un estado inconsistente si falla
      } finally {
        setCargando(false);
      }
    }
    obtenerSalones();
  }, [paginaActual, tamanoPagina]);

  const irAPaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual((prev) => prev - 1);
    }
  };

  const irAPaginaSiguiente = () => {
    if (salones.length === tamanoPagina) {
      setPaginaActual((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#0C447C]">
            Nuestros Salones
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona y visualiza todos los espacios disponibles para la
            realización de eventos.
          </p>
        </div>

        <button
          onClick={() =>
            alert("Próximamente: Formulario para crear un nuevo salón")
          }
          className="px-4 py-2.5 bg-[#0C447C] text-white font-medium text-sm rounded-lg hover:bg-[#0a3866] transition shadow-xs self-start sm:self-auto"
        >
          Agregar Salón
        </button>
      </div>

      <hr className="border-slate-200" />

      {/* Estado de carga */}
      {cargando ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#0C447C] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-slate-400">
            Cargando la lista de salones...
          </p>
        </div>
      ) : salones.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-xl border border-dashed border-slate-200 max-w-xl mx-auto shadow-sm">
          <p className="text-base text-slate-500 font-medium">
            {paginaActual > 1
              ? "No hay más salones registrados en esta página."
              : "No se encontraron salones registrados en el sistema."}
          </p>
          {paginaActual > 1 && (
            <button
              onClick={() => setPaginaActual(1)}
              className="mt-4 text-sm font-semibold text-[#0C447C] hover:underline"
            >
              Volver a la primera página
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Lista de Salones (Vertical Stack) */}
          <div className="space-y-3">
            {salones.map((salon) => (
              <div
                key={salon.salonId || salon.id}
                className="bg-white rounded-xl border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200 transition duration-150 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Información Principal */}
                <div className="flex items-start gap-4">
                  {/* Icono decorativo de Salón/Edificio */}
                  <div className="p-3 bg-slate-50 text-[#0C447C] rounded-lg hidden sm:block shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h18"
                      />
                    </svg>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800">
                      {salon.salonName || "Salón sin nombre"}
                    </h3>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <span className="font-semibold text-slate-700 sm:hidden">
                        Dirección:{" "}
                      </span>
                      {salon.address || "No especificada"}
                    </p>
                  </div>
                </div>

                {/* Badges e Identificadores (Lado derecho en escritorio) */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="text-xs font-bold text-[#0C447C] tracking-wider uppercase bg-blue-50/50 px-2 py-1 rounded">
                    ID: {salon.salonId}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-100">
                    Activo
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Controles del Paginador en el pie */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-200/60 text-sm">
            <span className="text-slate-500">
              Página{" "}
              <span className="font-semibold text-slate-700">
                {paginaActual}
              </span>
            </span>
            <div className="flex space-x-2">
              <button
                onClick={irAPaginaAnterior}
                disabled={paginaActual === 1}
                className={`px-4 py-2 border rounded-lg font-medium transition ${
                  paginaActual === 1
                    ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Anterior
              </button>
              <button
                onClick={irAPaginaSiguiente}
                disabled={salones.length < tamanoPagina}
                className={`px-4 py-2 border rounded-lg font-medium transition ${
                  salones.length < tamanoPagina
                    ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
