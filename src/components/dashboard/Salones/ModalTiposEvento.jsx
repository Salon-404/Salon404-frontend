import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useModalPortal } from "../../../hooks/useModalPortal";
import {
  getAllTypesBySalonId,
  createEventTypeBySalon,
} from "../../../services/eventTypeService";

export default function ModalTiposEvento({ salon, alCerrar }) {
  const modalContainer = useModalPortal();
  const [tipos, setTipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estado para alternar entre la lista de tarjetas y el formulario de alta
  const [modoFormulario, setModoFormulario] = useState(false);

  // Estado para los campos del formulario
  const [form, setForm] = useState({
    eventTypeName: "",
    maxDuration: "",
    initialPrice: "",
  });

  // Extraemos el ID del salón de manera segura
  const idSalon = salon?.salonId || salon?.id;

  useEffect(() => {
    // 1. Control de montaje para evitar fugas de memoria o respuestas tardías
    let activo = true;

    async function cargarTipos() {
      try {
        setCargando(true);
        // 2. Limpiamos los tipos del salón anterior inmediatamente para evitar visualizaciones cruzadas
        setTipos([]);

        const res = await getAllTypesBySalonId(idSalon);

        if (activo) {
          setTipos(Array.isArray(res) ? res : []);
        }
      } catch (error) {
        console.error("Error al cargar los tipos de evento:", error);
        if (activo) setTipos([]);
      } finally {
        if (activo) setCargando(false);
      }
    }

    if (idSalon) {
      cargarTipos();
    } else {
      console.warn("ModalTiposEvento: No se detectó un ID válido:", salon);
      setCargando(false);
    }

    // 3. Función de limpieza
    return () => {
      activo = false;
    };
  }, [idSalon]); // Reacciona de forma estricta al cambiar el ID del salón

  // Manejador de cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Manejador del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.eventTypeName || !form.maxDuration || !form.initialPrice) return;

    try {
      setGuardando(true);

      const jsonArmado = {
        salonId: idSalon,
        eventTypeName: form.eventTypeName,
        maxDuration: parseInt(form.maxDuration, 10),
        initialPrice: parseFloat(form.initialPrice),
      };

      await createEventTypeBySalon(jsonArmado);

      // Limpiamos formulario, regresamos a la lista y recargamos datos
      setForm({ eventTypeName: "", maxDuration: "", initialPrice: "" });
      setModoFormulario(false);

      // Volvemos a pedir al servidor los tipos actualizados de ESTE salón
      async function recargar() {
        const res = await getAllTypesBySalonId(idSalon);
        setTipos(Array.isArray(res) ? res : []);
      }
      await recargar();
    } catch (error) {
      console.error("Error al crear el tipo de evento:", error);
      alert(error.message || "Ocurrió un error al guardar el tipo de evento.");
    } finally {
      setGuardando(false);
    }
  };

  if (!modalContainer) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Cabecera */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            {modoFormulario ? "Nuevo Tipo de Evento" : "Tipos de Eventos"}:{" "}
            <span className="text-[#0C447C]">
              {salon?.salonName || "Salón"}
            </span>
          </h3>
          <button
            type="button"
            onClick={alCerrar}
            className="text-slate-400 hover:text-slate-600 transition text-xl font-medium"
          >
            &times;
          </button>
        </div>

        {/* Contenido Dinámico */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!modoFormulario ? (
            <>
              {/* VISTA: LISTA DE TARJETAS */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setModoFormulario(true)}
                  className="px-3.5 py-2 bg-[#0C447C] text-white font-medium text-xs rounded-lg hover:bg-[#0a3866] transition shadow-xs flex items-center gap-1.5"
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
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  Agregar Tipo de Evento
                </button>
              </div>

              {cargando ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-3 border-[#0C447C] border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-xs text-slate-400">
                    Cargando tipos de eventos...
                  </p>
                </div>
              ) : tipos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tipos.map((tipo) => {
                    const id = tipo.id;
                    const nombre = tipo.name || tipo.nombre || "Sin nombre";
                    const precio = tipo.price || tipo.precioBase || 0;
                    const duracion = tipo.duration || tipo.duracionMinutos || 0;

                    return (
                      <div
                        key={id}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between gap-3 hover:border-blue-300 hover:shadow-sm transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-slate-800 truncate">
                              {nombre}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                              Activo
                            </span>
                          </div>

                          <hr className="border-slate-100 my-1" />

                          <div className="text-xs text-slate-500 space-y-1.5 pt-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Duración:</span>
                              <strong className="text-slate-700 font-semibold">
                                {duracion} min
                              </strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                Precio Base:
                              </span>
                              <strong className="text-[#0C447C] font-bold">
                                ${precio.toLocaleString("es-AR")}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <p className="text-sm text-slate-500 font-medium">
                    Este salón no tiene tipos de eventos asociados.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* VISTA: FORMULARIO DE ALTA */
            <form
              onSubmit={handleSubmit}
              className="space-y-4 max-w-md mx-auto py-2"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">
                  Nombre del Tipo de Evento
                </label>
                <input
                  type="text"
                  name="eventTypeName"
                  required
                  value={form.eventTypeName}
                  onChange={handleChange}
                  placeholder="Ej: XV, Casamiento, Corporativo"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-[#0C447C] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    name="maxDuration"
                    required
                    min="1"
                    value={form.maxDuration}
                    onChange={handleChange}
                    placeholder="Ej: 360"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-[#0C447C] transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">
                    Precio Inicial ($)
                  </label>
                  <input
                    type="number"
                    name="initialPrice"
                    required
                    min="0"
                    step="0.01"
                    value={form.initialPrice}
                    onChange={handleChange}
                    placeholder="Ej: 20000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-[#0C447C] transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => setModoFormulario(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0C447C] hover:bg-[#0a3866] rounded-lg transition flex items-center gap-2"
                >
                  {guardando ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </>
                  ) : (
                    "Guardar Configuración"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Pie de modal */}
        {!modoFormulario && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={alCerrar}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>,
    modalContainer,
  );
}
