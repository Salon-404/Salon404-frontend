import { useState } from "react";
import { createPortal } from "react-dom";
import { createSalon } from "../../../services/salonService";
import { useModalPortal } from "../../../hooks/useModalPortal";
import Swal from "sweetalert2";

// 1. Importamos Uploadcare React Uploader y sus estilos core
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";

// REEMPLAZA ESTO con tu clave pública real del panel de Uploadcare
const UPLOADCARE_PUBLIC_KEY = "f64383c3f67edbc8a8ab";

const FORM_DATA_INICIAL = {
  name: "",
  description: "",
  address: "",
  startTime: "10:00:00",
  endTime: "22:00:00",
  profilePicture: "",
  salonDiagram: "",
  maxCap: "",
};

export default function ModalCrearSalon({ alCerrar, alGuardar }) {
  const [submitting, setSubmitting] = useState(false);
  const modalContainer = useModalPortal();

  const [formData, setFormData] = useState(FORM_DATA_INICIAL);

  // Usamos un "key" por uploader para poder resetearlos visualmente
  // (al cambiar el key, React vuelve a montar el componente desde cero)
  const [uploaderKeys, setUploaderKeys] = useState({
    perfil: 0,
    diagrama: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "maxCap" ? (value === "" ? "" : parseInt(value) || 0) : value,
    }));
  };

  // 2. Manejador para la Foto de Perfil
  const handleProfilePictureChange = (items) => {
    const archivosExitosos = items.allEntries.filter(
      (file) => file.status === "success",
    );
    if (archivosExitosos.length > 0) {
      setFormData((prev) => ({
        ...prev,
        profilePicture: archivosExitosos[0].cdnUrl,
      }));
    } else {
      setFormData((prev) => ({ ...prev, profilePicture: "" }));
    }
  };

  // 3. Manejador para el Diagrama del Salón
  const handleSalonDiagramChange = (items) => {
    const archivosExitosos = items.allEntries.filter(
      (file) => file.status === "success",
    );
    if (archivosExitosos.length > 0) {
      setFormData((prev) => ({
        ...prev,
        salonDiagram: archivosExitosos[0].cdnUrl,
      }));
    } else {
      setFormData((prev) => ({ ...prev, salonDiagram: "" }));
    }
  };

  const handleCancelar = () => {
    const huboArchivosSubidos =
      formData.profilePicture || formData.salonDiagram;

    setFormData(FORM_DATA_INICIAL);
    setUploaderKeys({ perfil: 0, diagrama: 0 });

    if (huboArchivosSubidos) {
      console.info(
        "Se cancelaron archivos subidos. Si necesitás eliminarlos también de Uploadcare, hacelo desde un endpoint del backend usando la secret key.",
      );
    }

    alCerrar();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const bodyListoParaBackend = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        startTime:
          formData.startTime.length === 5
            ? `${formData.startTime}:00`
            : formData.startTime,
        endTime:
          formData.endTime.length === 5
            ? `${formData.endTime}:00`
            : formData.endTime,
        profilePicture: formData.profilePicture,
        salonDiagram: formData.salonDiagram,
        maxCap: formData.maxCap === "" ? 0 : Number(formData.maxCap),
      };

      await createSalon(bodyListoParaBackend);
      alGuardar();
      alCerrar();
    } catch (error) {
      console.error("Error al crear el salón:", error);
      Swal.fire({
        title: "¡Error!",
        text: "Hubo un error al agregar el salon.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#0C447C",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!modalContainer) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 border-l-4 border-[#0C447C] pl-2">
            Agregar Nuevo Salón
          </h3>
          <button
            type="button"
            onClick={handleCancelar}
            className="text-slate-400 hover:text-slate-600 transition text-xl font-medium"
          >
            &times;
          </button>
        </div>

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
            />
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
              placeholder="Ej: Av. Calchaquí 1200"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
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
                className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0C447C]"
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
                className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0C447C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Capacidad Máx
              </label>
              <input
                type="number"
                name="maxCap"
                value={formData.maxCap}
                onChange={handleChange}
                className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0C447C]"
                placeholder="150"
              />
            </div>
          </div>

          {/* 4. IMPLEMENTACIÓN UPLOADCARE: Foto de Perfil */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Foto de Perfil
            </label>

            {formData.profilePicture && (
              <div className="mb-2 flex items-center gap-3">
                <img
                  src={formData.profilePicture}
                  alt="Vista previa de foto de perfil"
                  className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                />
              </div>
            )}

            <FileUploaderRegular
              key={uploaderKeys.perfil}
              ctxName="uploader-perfil-salon"
              pubkey={UPLOADCARE_PUBLIC_KEY}
              multiple={false}
              imgOnly={true}
              sourceList="local, url, camera"
              onChange={handleProfilePictureChange}
            />
            {formData.profilePicture && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                ✓ Imagen cargada con éxito
              </p>
            )}
          </div>

          {/* 5. IMPLEMENTACIÓN UPLOADCARE: Distribución / Diagrama */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Distribución / Diagrama
            </label>

            {formData.salonDiagram && (
              <div className="mb-2 flex items-center gap-3">
                <img
                  src={formData.salonDiagram}
                  alt="Vista previa del diagrama"
                  className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                />
              </div>
            )}

            <FileUploaderRegular
              key={uploaderKeys.diagrama}
              ctxName="uploader-diagrama-salon"
              pubkey={UPLOADCARE_PUBLIC_KEY}
              multiple={false}
              imgOnly={true}
              sourceList="local, url"
              onChange={handleSalonDiagramChange}
            />
            {formData.salonDiagram && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                ✓ Diagrama cargado con éxito
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelar}
              disabled={submitting}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#0C447C] text-white rounded-lg text-sm font-medium hover:bg-[#0a3866] transition shadow-xs"
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
