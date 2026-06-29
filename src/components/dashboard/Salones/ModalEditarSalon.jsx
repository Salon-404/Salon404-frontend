import { useState } from "react";
import { createPortal } from "react-dom";
import { updateSalon } from "../../../services/salonService";
import { useModalPortal } from "../../../hooks/useModalPortal";

export default function ModalEditarSalon({ salon, alCerrar, alGuardar }) {
  const [submitting, setSubmitting] = useState(false);
  const modalContainer = useModalPortal();
  const [nuevoLinkFoto, setNuevoLinkFoto] = useState("");

  const [formData, setFormData] = useState({
    salonName: salon.salonName || "",
    description: salon.description || "",
    address: salon.address || "",
    startTime: salon.startTime || "10:00:00",
    endTime: salon.endTime || "22:00:00",
    maxCap: salon.maxCap ?? "",
    salonStatusId: salon.salonStatusId ?? 1,
    salonDiagram: salon.salonDiagram || "",
    profilePicture: salon.profilePicture || "",
    cleaningTime: salon.cleaningTime ?? 0,
    photos: salon.photos || [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "maxCap" || name === "salonStatusId" || name === "cleaningTime"
          ? value === ""
            ? ""
            : parseInt(value) || 0
          : value,
    }));
  };

  const handleAgregarFoto = () => {
    if (!nuevoLinkFoto.trim()) return;
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, nuevoLinkFoto.trim()],
    }));
    setNuevoLinkFoto("");
  };

  const handleRemoverFoto = (indexARemover) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== indexARemover),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const bodyListoParaBackend = {
        salonName: formData.salonName,
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
        maxCap: formData.maxCap === "" ? 0 : Number(formData.maxCap),
        salonStatusId: Number(formData.salonStatusId),
        salonDiagram: formData.salonDiagram,
        profilePicture: formData.profilePicture,
        cleaningTime: Number(formData.cleaningTime),
        photos: formData.photos,
      };

      await updateSalon(salon.salonId, bodyListoParaBackend);
      alGuardar();
      alCerrar();
    } catch (error) {
      console.error("Error al modificar el salón:", error);
      alert("Hubo un error al actualizar los datos del salón.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!modalContainer) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            Modificar Salón:{" "}
            <span className="text-[#0C447C]">{salon.salonName}</span>
          </h3>
          <button
            type="button"
            onClick={alCerrar}
            className="text-slate-400 hover:text-slate-600 transition text-xl font-medium"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Nombre del Salón *
              </label>
              <input
                type="text"
                name="salonName"
                required
                value={formData.salonName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0C447C]"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Estado *
              </label>
              <select
                name="salonStatusId"
                value={formData.salonStatusId}
                onChange={handleChange}
                className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0C447C] bg-white font-medium text-slate-700"
              >
                <option value={1}>Disponible</option>
                <option value={2}>En mantenimiento</option>
                <option value={3}>Cerrado</option>
              </select>
            </div>
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
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
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
                Capacidad
              </label>
              <input
                type="number"
                name="maxCap"
                value={formData.maxCap}
                onChange={handleChange}
                className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0C447C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Limpieza (m)
              </label>
              <input
                type="number"
                name="cleaningTime"
                value={formData.cleaningTime}
                onChange={handleChange}
                className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0C447C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Foto de Perfil (URL)
            </label>
            <input
              type="text"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0C447C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Distribución / Diagrama (URL)
            </label>
            <input
              type="text"
              name="salonDiagram"
              value={formData.salonDiagram}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0C447C]"
            />
          </div>

          {/* Sección de Gestión Dinámica de Lista de Fotos */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Galería de Fotos (Lista de Links)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nuevoLinkFoto}
                onChange={(e) => setNuevoLinkFoto(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0C447C] bg-white"
                placeholder="Pegar link de la imagen de galería..."
              />
              <button
                type="button"
                onClick={handleAgregarFoto}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition shrink-0"
              >
                Añadir Link
              </button>
            </div>

            {formData.photos.length > 0 ? (
              <div className="max-h-24 overflow-y-auto space-y-1.5 pt-1">
                {formData.photos.map((link, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white px-2 py-1 border border-slate-100 rounded-md gap-2"
                  >
                    <span className="text-[11px] text-slate-600 truncate flex-1 font-mono">
                      {link}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoverFoto(idx)}
                      className="text-rose-500 hover:text-rose-700 text-xs px-1 font-bold transition"
                      title="Eliminar link"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic pt-1">
                No hay links adicionales en la galería de fotos.
              </p>
            )}
          </div>

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
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition shadow-xs"
            >
              {submitting ? "Actualizando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalContainer,
  );
}
