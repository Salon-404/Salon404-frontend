import { useState } from "react";
import { createPortal } from "react-dom";
import { updateSalon } from "../../../services/salonService";
import { useModalPortal } from "../../../hooks/useModalPortal";
import Swal from "sweetalert2";

// Uploadcare React Uploader y estilos core
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";

// REEMPLAZA ESTO con tu clave pública real del panel de Uploadcare
const UPLOADCARE_PUBLIC_KEY = "f64383c3f67edbc8a8ab";

export default function ModalEditarSalon({ salon, alCerrar, alGuardar }) {
  const [submitting, setSubmitting] = useState(false);
  const modalContainer = useModalPortal();

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

  // Foto de perfil: reemplaza la imagen anterior por la nueva subida
  const handleProfilePictureChange = (items) => {
    const archivosExitosos = items.allEntries.filter(
      (file) => file.status === "success",
    );
    if (archivosExitosos.length > 0) {
      setFormData((prev) => ({
        ...prev,
        profilePicture: archivosExitosos[0].cdnUrl,
      }));
    }
  };

  // Diagrama del salón: reemplaza la imagen anterior por la nueva subida
  const handleSalonDiagramChange = (items) => {
    const archivosExitosos = items.allEntries.filter(
      (file) => file.status === "success",
    );
    if (archivosExitosos.length > 0) {
      setFormData((prev) => ({
        ...prev,
        salonDiagram: archivosExitosos[0].cdnUrl,
      }));
    }
  };

  // Galería de fotos: permite múltiples imágenes, se van agregando a la lista existente
  const handlePhotosChange = (items) => {
    const archivosExitosos = items.allEntries.filter(
      (file) => file.status === "success",
    );
    if (archivosExitosos.length === 0) return;

    setFormData((prev) => {
      const urlsExistentes = new Set(prev.photos);
      const urlsNuevas = archivosExitosos
        .map((file) => file.cdnUrl)
        .filter((url) => !urlsExistentes.has(url));

      if (urlsNuevas.length === 0) return prev;

      return {
        ...prev,
        photos: [...prev.photos, ...urlsNuevas],
      };
    });
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
      Swal.fire({
        title: "¡Error!",
        text: "Hubo un error al actualizar los datos del salón.",
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

          {/* FOTO DE PERFIL: preview de la actual + uploader para reemplazarla */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Foto de Perfil
            </label>

            {formData.profilePicture && (
              <div className="mb-2 flex items-center gap-3">
                <img
                  src={formData.profilePicture}
                  alt="Foto de perfil actual"
                  className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                />
                <span className="text-xs text-slate-500">Imagen actual.</span>
              </div>
            )}

            <FileUploaderRegular
              ctxName="uploader-perfil-salon-editar"
              pubkey={UPLOADCARE_PUBLIC_KEY}
              multiple={false}
              imgOnly={true}
              sourceList="local, url, camera"
              onChange={handleProfilePictureChange}
            />
            {formData.profilePicture && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                ✓ Imagen lista
              </p>
            )}
          </div>

          {/* DIAGRAMA: preview del actual + uploader para reemplazarlo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Distribución / Diagrama
            </label>

            {formData.salonDiagram && (
              <div className="mb-2 flex items-center gap-3">
                <img
                  src={formData.salonDiagram}
                  alt="Diagrama actual"
                  className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                />
                <span className="text-xs text-slate-500">Diagrama actual.</span>
              </div>
            )}

            <FileUploaderRegular
              ctxName="uploader-diagrama-salon-editar"
              pubkey={UPLOADCARE_PUBLIC_KEY}
              multiple={false}
              imgOnly={true}
              sourceList="local, url"
              onChange={handleSalonDiagramChange}
            />
            {formData.salonDiagram && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                ✓ Diagrama listo
              </p>
            )}
          </div>

          {/* GALERÍA DE FOTOS: carga múltiple con preview y opción de quitar */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Galería de Fotos
            </label>

            <FileUploaderRegular
              ctxName="uploader-galeria-salon-editar"
              pubkey={UPLOADCARE_PUBLIC_KEY}
              multiple={true}
              imgOnly={true}
              sourceList="local, url, camera"
              onChange={handlePhotosChange}
            />

            {formData.photos.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 pt-2">
                {formData.photos.map((link, idx) => (
                  <div
                    key={`${link}-${idx}`}
                    className="relative group rounded-md overflow-hidden border border-slate-200 bg-white"
                  >
                    <img
                      src={link}
                      alt={`Foto de galería ${idx + 1}`}
                      className="w-full h-16 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoverFoto(idx)}
                      title="Eliminar foto"
                      className="absolute top-0.5 right-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold leading-none shadow-sm transition opacity-90 group-hover:opacity-100"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic pt-1">
                No hay fotos en la galería todavía.
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
