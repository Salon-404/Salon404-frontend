import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getSalons, createSalon } from "../../services/salonService";

export default function Salones() {
  const [salones, setSalones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [tamanoPagina] = useState(10);

  // Estado para forzar el refresco de la lista
  const [refrescarDisparador, setRefrescarDisparador] = useState(0);

  // Estado para el modal de creación
  const [modalAbierto, setModalAbierto] = useState(false);

  // Cargar salones al cambiar de página o al forzar un refresco
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
  }, [paginaActual, tamanoPagina, refrescarDisparador]); // <-- Agregamos el disparador como dependencia

  const irAPaginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual((prev) => prev - 1);
  };

  const irAPaginaSiguiente = () => {
    if (salones.length === tamanoPagina) setPaginaActual((prev) => prev + 1);
  };

  // Callback al crear un salón exitosamente
  const handleSalonCreado = () => {
    setPaginaActual(1); // Volvemos a la página 1
    setRefrescarDisparador((prev) => prev + 1); // Forzamos el re-fetch sumando al contador
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
          onClick={() => setModalAbierto(true)}
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
                    <h3 className="text-base font-bold text-slate-800">
                      {salon.salonName || "Salón sin nombre"}
                    </h3>
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
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="text-xs font-bold text-[#0C447C] tracking-wider uppercase bg-blue-50/50 px-2 py-1 rounded">
                    ID: {salon.salonId?.substring(0, 8)}...
                  </span>
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
      {modalAbierto && (
        <ModalCrearSalon
          alCerrar={() => setModalAbierto(false)}
          alGuardar={handleSalonCreado}
        />
      )}
    </div>
  );
}

// COMPONENTE MODAL
function ModalCrearSalon({ alCerrar, alGuardar }) {
  const [submitting, setSubmitting] = useState(false);
  const [modalContainer, setModalContainer] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    startTime: "10:00:00",
    endTime: "22:00:00",
    profilePicture: "",
    salonDiagram: "",
    maxCap: "",
  });

  useEffect(() => {
    let container = document.getElementById("modal-root");
    if (!container) {
      container = document.createElement("div");
      container.id = "modal-root";
      document.body.appendChild(container);
    }
    setModalContainer(container);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "maxCap" ? (value === "" ? "" : parseInt(value) || "") : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const datosFormateados = {
        ...formData,
        maxCap: formData.maxCap === "" ? 0 : formData.maxCap,
        startTime:
          formData.startTime.length === 5
            ? `${formData.startTime}:00`
            : formData.startTime,
        endTime:
          formData.endTime.length === 5
            ? `${formData.endTime}:00`
            : formData.endTime,
      };

      await createSalon(datosFormateados);
      alGuardar(); // Dispara la actualización en el componente padre
      alCerrar();
    } catch (error) {
      console.error("Error al crear el salón:", error);
      alert("Hubo un error al guardar el salón.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!modalContainer) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            Agregar Nuevo Salón
          </h3>
          <button
            type="button"
            onClick={alCerrar}
            className="text-slate-400 hover:text-slate-600 transition text-xl font-medium"
          >
            &times;
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Nombre del Salón *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0C447C]"
              placeholder="Ej: Salón Imperio"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              rows="2"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0C447C]"
              placeholder="Detalles del salón..."
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Dirección *
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0C447C]"
              placeholder="Ej: Av. Calchaquí 1200, Quilmes"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Apertura
              </label>
              <input
                type="time"
                step="1"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0C447C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Cierre
              </label>
              <input
                type="time"
                step="1"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0C447C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Capacidad Máx
              </label>
              <input
                type="number"
                min="1"
                name="maxCap"
                value={formData.maxCap}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0C447C]"
                placeholder="Ej: 150"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Foto de Perfil (URL o Base64)
            </label>
            <input
              type="text"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0C447C]"
              placeholder="https://link-de-la-imagen.com/foto.jpg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Distribución de Mesas / Diagrama (URL o Base64)
            </label>
            <input
              type="text"
              name="salonDiagram"
              value={formData.salonDiagram}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0C447C]"
              placeholder="https://link-de-la-imagen.com/plano.jpg"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={alCerrar}
              disabled={submitting}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#0C447C] text-white rounded-lg text-sm font-medium hover:bg-[#0a3866] transition shadow-xs flex items-center gap-2"
            >
              {submitting ? "Guardando..." : "Guardar Salón"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalContainer,
  );
}
