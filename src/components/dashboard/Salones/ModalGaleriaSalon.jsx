import { createPortal } from "react-dom";
import { useModalPortal } from "../../../hooks/useModalPortal";

export default function ModalGaleriaSalon({
  salonName,
  photos = [],
  alCerrar,
}) {
  const modalContainer = useModalPortal();

  if (!modalContainer) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Cabecera */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            Galería de Fotos:{" "}
            <span className="text-[#0C447C]">{salonName}</span>
          </h3>
          <button
            type="button"
            onClick={alCerrar}
            className="text-slate-400 hover:text-slate-600 transition text-xl font-medium"
          >
            &times;
          </button>
        </div>

        {/* Contenido / Grilla de Fotos */}
        <div className="p-6 overflow-y-auto bitacora-galeria">
          {photos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {photos.map((url, idx) => (
                <div
                  key={idx}
                  className="group relative bg-slate-50 rounded-lg overflow-hidden border border-slate-100 aspect-video shadow-xs hover:shadow-md transition duration-200"
                >
                  <img
                    src={url}
                    alt={`Foto ${idx + 1} de ${salonName}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/600x400?text=Error+al+cargar+imagen";
                    }}
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-slate-900/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white font-mono truncate">
                      {url}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <p className="text-sm text-slate-500 font-medium">
                Este salón no tiene fotos adicionales en su galería.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Podés agregar enlaces de imágenes desde la opción "Modificar".
              </p>
            </div>
          )}
        </div>

        {/* Pie de modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={alCerrar}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    modalContainer,
  );
}
