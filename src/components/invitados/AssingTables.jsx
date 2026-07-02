import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import { getTablesByEventId } from "../../services/mesasService";
import { invitadosService } from "../../services/invitadosService";
import { getApiErrorMessage } from "../../utils/apiError";

export default function AssignTables({
  eventId,
  invitados,
  onRefresh,
  onClose,
}) {
  const [tables, setTables] = useState([]);
  const [guestSelected, setGuestSelected] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [hoveredTable, setHoveredTable] = useState(null);

  // ---------------- LOAD ----------------
  useEffect(() => {
    if (!eventId) return;

    const load = async () => {
      try {
        const mesas = await getTablesByEventId(eventId);
        setTables(mesas);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: getApiErrorMessage(err, "No se pudieron cargar las mesas"),
        });
      }
    };

    load();
  }, [eventId]);

  // ---------------- DRAG START ----------------
  const handleDragStart = (guest) => {
    setGuestSelected(guest);
    setDragging(true);
  };

  // ---------------- DROP ----------------
  const handleDrop = async (mesa) => {
    if (!guestSelected) return;

    const mesaLlena =
      (mesa.guests?.length ?? 0) >= mesa.capacity;

    if (mesaLlena) {
      Swal.fire({
        icon: "warning",
        title: "Mesa llena",
        text: "Esta mesa ya no tiene cupos disponibles",
      });
      return;
    }

    try {
      await invitadosService.update(eventId, guestSelected.id, {
        ...guestSelected,
        tableId: mesa.id,
      });

      Swal.fire({
        icon: "success",
        title: "Asignado",
        text: `${guestSelected.fullName} → ${mesa.tableName}`,
      });

      await onRefresh();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: getApiErrorMessage(err, "No se pudo asignar mesa"),
      });
    }

    setDragging(false);
    setGuestSelected(null);
    setHoveredTable(null);
  };

  // ---------------- UI ----------------
  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex overflow-hidden">

        {/* LEFT: INVITADOS */}
        <div className="w-1/2 border-r overflow-y-auto p-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-bold text-[#185FA5]">
              Invitados
            </h2>

            <button
              onClick={onClose}
              className="text-xl text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          </div>

          {invitados.map((g) => (
            <div
              key={g.id}
              draggable
              onDragStart={() => handleDragStart(g)}
              className={`p-3 mb-2 rounded-xl text-white cursor-grab select-none
                ${g.tableId ? "bg-emerald-600" : "bg-[#185FA5]"}`}
            >
              <div className="font-semibold">
                {g.fullName}
              </div>
              <div className="text-xs opacity-80">
                {g.tableName || "Sin mesa"}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: MESAS */}
        <div className="w-1/2 p-4 overflow-y-auto bg-slate-50">
          <h2 className="text-lg font-bold text-[#185FA5] mb-4">
            Mesas
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {tables.map((mesa) => {
              const isFull =
                (mesa.guests?.length ?? 0) >= mesa.capacity;

              return (
                <div
                  key={mesa.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={() => setHoveredTable(mesa.id)}
                  onDragLeave={() => setHoveredTable(null)}
                  onDrop={() => handleDrop(mesa)}
                  className={`p-4 rounded-xl border text-center transition-all cursor-pointer
                    ${
                      hoveredTable === mesa.id
                        ? "scale-105 border-[#185FA5]"
                        : "border-slate-200"
                    }
                    ${isFull ? "bg-red-100" : "bg-white"}
                  `}
                >
                  <div className="font-bold text-[#185FA5]">
                    {mesa.tableName}
                  </div>

                  <div className="text-sm text-slate-500">
                    {mesa.guests?.length ?? 0} / {mesa.capacity}
                  </div>

                  {isFull && (
                    <div className="text-xs text-red-600 mt-1">
                      Mesa llena
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}