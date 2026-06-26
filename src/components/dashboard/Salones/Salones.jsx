import { useEffect, useState } from "react";
import { getSalons } from "../../../services/salonService";
import ModalCrearSalon from "./ModalCrearSalon";
import ModalEditarSalon from "./ModalEditarSalon";
import ModalGaleriaSalon from "./ModalGaleriaSalon"; // <-- 1. Importamos el nuevo modal

export default function Salones() {
  const [salones, setSalones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [tamanoPagina] = useState(10);

  // Estado para forzar el refresco de la lista
  const [refrescarDisparador, setRefrescarDisparador] = useState(0);

  // Estados para los modales
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [salonAEditar, setSalonAEditar] = useState(null);
  const [salonAVerFotos, setSalonAVerFotos] = useState(null); // <-- 2. Estado para la galería de fotos

  // Cargar salones
  useEffect(() => {
    async function obtenerSalones() {
      try {
        setCargando(true);
        const res = await getSalons(paginaActual, tamanoPagina);
        setSalones(res);
      } catch (error) {
        console.error("Error al cargar los salones paginados:", error);
        setSalones([]);
      } finally {
        setCargando(false);
      }
    }
    obtenerSalones();
  }, [paginaActual, tamanoPagina, refrescarDisparador]);

  const irAPaginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual((prev) => prev - 1);
  };

  const irAPaginaSiguiente = () => {
    if (salones.length === tamanoPagina) setPaginaActual((prev) => prev + 1);
  };

  const handleListaActualizada = () => {
    setRefrescarDisparador((prev) => prev + 1);
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
          onClick={() => setModalCrearAbierto(true)}
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
          {/* Lista de Salones */}
          <div className="space-y-3">
            {salones.map((salon) => (
              <div
                key={salon.salonId}
                className="bg-white rounded-xl border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200 transition duration-150 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  {salon.profilePicture ? (
                    <img
                      src={salon.profilePicture}
                      alt={`Foto de ${salon.salonName}`}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/150?text=Salon";
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-50 text-[#0C447C] rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
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
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-800">
                        {salon.salonName || "Salón sin nombre"}
                      </h3>

                      {salon.status && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            salon.status.toLowerCase() === "disponible"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : salon.status.toLowerCase() ===
                                  "en mantenimiento"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}
                        >
                          {salon.status}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      {salon.description || "Sin descripción"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Dirección:{" "}
                      <span className="text-slate-600 font-medium">
                        {salon.address || "No especificada"}
                      </span>
                      <span className="mx-2">•</span>
                      Capacidad Máx:{" "}
                      <span className="font-semibold text-[#0C447C]">
                        {salon.maxCap ?? 0} personas
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Horario:{" "}
                      <span className="text-slate-600">
                        {salon.startTime?.substring(0, 5) || "00:00"} a{" "}
                        {salon.endTime?.substring(0, 5) || "00:00"}
                      </span>
                      {salon.cleaningTime > 0 && (
                        <>
                          <span className="mx-2">•</span>
                          Limpieza:{" "}
                          <span className="text-slate-600">
                            {salon.cleaningTime} min
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* <-- 3. BOTÓN NUEVO: FOTOS --> */}
                  <button
                    onClick={() => setSalonAVerFotos(salon)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#0C447C] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-3.5 h-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z"
                      />
                    </svg>
                    Fotos
                  </button>

                  <button
                    onClick={() => setSalonAEditar(salon)}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
                  >
                    Modificar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginador */}
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

      {/* Modal de creación */}
      {modalCrearAbierto && (
        <ModalCrearSalon
          alCerrar={() => setModalCrearAbierto(false)}
          alGuardar={() => {
            setPaginaActual(1);
            handleListaActualizada();
          }}
        />
      )}

      {/* Modal de edición */}
      {salonAEditar && (
        <ModalEditarSalon
          salon={salonAEditar}
          alCerrar={() => setSalonAEditar(null)}
          alGuardar={handleListaActualizada}
        />
      )}

      {/* <-- 4. RENDER DEL NUEVO MODAL DE GALERÍA --> */}
      {salonAVerFotos && (
        <ModalGaleriaSalon
          salonName={salonAVerFotos.salonName}
          photos={salonAVerFotos.photos}
          alCerrar={() => setSalonAVerFotos(null)}
        />
      )}
    </div>
  );
}
