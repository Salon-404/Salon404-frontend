import { useEffect, useRef, useState } from "react";
import { invitadosService } from "../../services/invitadosService";
import Swal from "sweetalert2"; // Asegurate de tenerlo importado acá
import {  getSalonDiagram } from "../../services/eventosService";
import {  getTablesByEventId } from "../../services/mesasService";
export function InvitadosList({ eventId }) {
  const [invitados, setInvitados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalInvitados, setTotalInvitados] = useState(0);
  const TAMANIO_PAGINA = 10;

  // Estado para controlar qué menú "Gestionar" está abierto
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

  // Estado del Modal de Agregar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guardandoInvitado, setGuardandoInvitado] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    dietTypeId: "1",
  });

  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 800;
  const canvasRef = useRef(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [guestSelected, setGuestSelected] = useState(null);
  const [tables, setTables] = useState([]);
  const [diagram, setDiagram] = useState(null);
  const [draggingGuest, setDraggingGuest] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [hoveredMesaId, setHoveredMesaId] = useState(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const assignContainerRef = useRef(null);
  const imgRef = useRef(null);
  const [imgRect, setImgRect] = useState(null);


  const cargarInvitados = async () => {
    try {
      setCargando(true);
      setError(null);
      const respuesta = await invitadosService.getAll(
        eventId,
        paginaActual,
        TAMANIO_PAGINA,
      );
      if (respuesta) {
        setInvitados(Array.isArray(respuesta.data) ? respuesta.data : []);
        setTotalPaginas(respuesta.totalPages || 1);
        setTotalInvitados(respuesta.total || 0);
      }
    } catch (err) {
      console.error("Error al cargar invitados:", err);
      setError("No se pudieron cargar los invitados.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (eventId) cargarInvitados();
  }, [eventId, paginaActual]);

 useEffect(() => {
    if (!showAssignModal) return;

    const medir = () => {
      const container = assignContainerRef.current;
      const img = imgRef.current;

      if (!container || !img) return;

      const cRect = container.getBoundingClientRect();
      const iRect = img.getBoundingClientRect();

      setImgRect({
        left: iRect.left - cRect.left,
        top: iRect.top - cRect.top,
        width: iRect.width,
        height: iRect.height,
      });
    };

    medir();
    window.addEventListener("resize", medir);

    return () => window.removeEventListener("resize", medir);
  }, [showAssignModal, diagram]);

  
  useEffect(() => {
    if (eventId) {
      cargarInvitados();
    }
  }, [eventId, paginaActual]);

  // Cerrar menús flotantes al hacer clic afuera
  useEffect(() => {
    const cerrarMenu = () => setMenuAbiertoId(null);
    document.addEventListener("click", cerrarMenu);
    return () => document.removeEventListener("click", cerrarMenu);
  }, []);

  // Medir el tamaño real del contenedor del diagrama (para corregir la proporción de las mesas)
  useEffect(() => {
    if (!showAssignModal) return;
    const el = assignContainerRef.current;
    if (!el) return;

    const medir = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };

    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showAssignModal, diagram]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setErrorFormulario("El nombre completo es obligatorio.");
      return;
    }
    try {
      setGuardandoInvitado(true);
      setErrorFormulario(null);
      await invitadosService.create(eventId, formData);
      setFormData({ fullName: "", phone: "", email: "", dietTypeId: "1" });
      setIsModalOpen(false);
      cargarInvitados();
    } catch (err) {
      const mensajeError =
        err.response?.data?.message || "Error al registrar el invitado.";
      setErrorFormulario(mensajeError);
    } finally {
      setGuardandoInvitado(false);
    }
  };

 const handleDropGuest = async (mesa) => {
  if (!guestSelected) return;

  try {
    await invitadosService.update(
      eventId,
      guestSelected.id,
      {
        fullName: guestSelected.fullName,
        phone: guestSelected.phone,
        email: guestSelected.email,
        dietTypeId: guestSelected.dietTypeId,
        guestStatusId: guestSelected.guestStatusId,
        tableId: mesa.id,
      }
    );

    await cargarInvitados();

    Swal.fire({
      title: "Mesa asignada",
      text: `${guestSelected.fullName} fue asignado a ${mesa.tableName}`,
      icon: "success",
      confirmButtonColor: "#185FA5",
    });

    setShowAssignModal(false);
    setGuestSelected(null);
    setDraggingGuest(false);
  } catch (err) {
    console.error(err);

    Swal.fire({
      title: "Error",
      text: "No se pudo asignar la mesa.",
      icon: "error",
      confirmButtonColor: "#185FA5",
    });
  }
};

  // --- DRAG MANUAL DEL INVITADO (mouse) ---
 const updateDragPos = (e) => {
  const rect = canvasRef.current?.getBoundingClientRect();
  if (!rect) return;

  setDragPos({
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  });
};

  const handleGuestMouseDown = (e) => {
    e.preventDefault();
    updateDragPos(e);
    setDraggingGuest(true);
  };

  const handleContainerMouseMove = (e) => {
    if (!draggingGuest) return;
    updateDragPos(e);
  };

  const handleContainerMouseUp = () => {
    if (draggingGuest && hoveredMesaId) {
      const mesa = tables.find((t) => t.id === hoveredMesaId);
      const mesaLlena = mesa && (mesa.guests?.length ?? 0) >= mesa.capacity;
      if (mesa && !mesaLlena) {
        handleDropGuest(mesa);
      }
    }
    setDraggingGuest(false);
    setHoveredMesaId(null);
  };



  // --- ACCIONES DEL MENÚ GESTIONAR ---
  const handleBorrar = async (invitadoId) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará al invitado permanentemente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#185FA5", // Color azul de tu app
      cancelButtonColor: "#ef4444", // Color rojo de Tailwind
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await invitadosService.delete(eventId, invitadoId);
          await cargarInvitados();
          Swal.fire({
            title: "¡Eliminado!",
            text: "El invitado fue removido con éxito.",
            icon: "success",
            confirmButtonColor: "#185FA5",
          });
        } catch (error) {
          console.error("Error al borrar invitado:", error);

          // Alerta de error con Swal
          Swal.fire({
            title: "Error",
            text: "No se pudo eliminar al invitado.",
            icon: "error",
            confirmButtonColor: "#185FA5",
          });
        }
      }
    });
  };

  const handleAsignarMesa = async (invitado) => {
    try {
      const [mesas, plano] = await Promise.all([
        getTablesByEventId(eventId),
        getSalonDiagram(eventId),
      ]);

      setGuestSelected(invitado);
      setTables(mesas);
      setDiagram(plano);
      setShowAssignModal(true);
      setMenuAbiertoId(null);
      setDraggingGuest(false);
      setHoveredMesaId(null);
    } catch (err) {
      console.error(err);

      Swal.fire({
        title: "Error",
        text: "No se pudo cargar el plano del salón.",
        icon: "error",
        confirmButtonColor: "#185FA5",
      });
    }
  };


  const handleGenerarInvitacion = (invitado) => {
    // Construimos la URL pública incluyendo el eventId del componente y el id del invitado
    const linkInvitacion = `${window.location.origin}/invitacion/${eventId}/${invitado.id}`;

    // Copiamos el link al portapapeles automáticamente
    navigator.clipboard.writeText(linkInvitacion);

    // Mostramos el aviso estético con SweetAlert2
    Swal.fire({
      title: "¡Link Generado!",
      html: `El enlace de invitación para <b>${invitado.fullName}</b> fue copiado al portapapeles.<br/><br/><small class="text-slate-400">${linkInvitacion}</small>`,
      icon: "success",
      confirmButtonColor: "#185FA5",
    });
  };

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#0C447C] mb-1">
            Invitados
          </h2>
          <p className="text-slate-500 text-sm">
            Tienes{" "}
            <span className="font-semibold text-slate-700">
              {totalInvitados}
            </span>{" "}
            invitados registrados.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#185FA5] hover:bg-[#0C447C] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          + Agregar Invitado
        </button>
      </div>

      {/* TABLA / CONTENIDO */}
      {cargando ? (
        <p className="text-slate-500 text-sm py-4 animate-pulse">
          Cargando invitados...
        </p>
      ) : error ? (
        <p className="text-red-500 text-sm py-4">{error}</p>
      ) : invitados.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <p className="text-slate-400 text-sm">
            No hay invitados registrados en este evento.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Nombre Completo</th>
                    <th className="px-6 py-4">Contacto</th>
                    <th className="px-6 py-4">Detalles</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invitados.map((invitado) => (
                    <tr
                      key={invitado.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {invitado.fullName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900 text-xs font-medium">
                          {invitado.email || "-"}
                        </div>
                        <div className="text-slate-400 text-xs">
                          {invitado.phone || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs space-y-1">
                        <div>
                          <span className="text-slate-400">Mesa:</span>{" "}
                          <span className="font-medium text-slate-700">
                            {invitado.tableName || "Sin asignar"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Menú:</span>{" "}
                          <span className="font-medium text-slate-700">
                            {invitado.dietTypeName || "Estándar"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            invitado.guestStatusId === 2
                              ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                              : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                          }`}
                        >
                          {invitado.guestStatusName}
                        </span>
                      </td>

                      {/* ACCIONES CON DROPDOWN */}
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuAbiertoId(
                              menuAbiertoId === invitado.id
                                ? null
                                : invitado.id,
                            );
                          }}
                          className="text-xs font-medium text-[#185FA5] hover:text-[#0C447C] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all inline-flex items-center gap-1"
                        >
                          Gestionar <span>▼</span>
                        </button>

                        {/* CUADRO DE OPCIONES FLOTANTE */}
                        {menuAbiertoId === invitado.id && (
                          <div className="absolute right-6 mt-1 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-10 text-left text-sm animate-fade-in">
                            <button
                              onClick={() => handleGenerarInvitacion(invitado)}
                              className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                            >
                              Generar Invitación
                            </button>
                            <button
                              onClick={() => handleAsignarMesa(invitado)}
                              className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                            >
                              Asignar Mesa
                            </button>
                            <hr className="border-slate-100 my-1" />
                            <button
                              onClick={() => handleBorrar(invitado.id)}
                              className="w-full px-4 py-2 hover:bg-red-50 text-red-600 font-medium flex items-center gap-2"
                            >
                              Borrar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINACIÓN */}
          <div className="flex items-center justify-between border-t border-slate-100 py-3">
            <p className="text-sm text-slate-500">
              Página {paginaActual} de {totalPaginas}
            </p>
            <div className="inline-flex space-x-2">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => p - 1)}
                className="px-3 py-1.5 text-sm font-medium border rounded-lg bg-white disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual((p) => p + 1)}
                className="px-3 py-1.5 text-sm font-medium border rounded-lg bg-white disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL DE AGREGAR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0C447C]">
                Nuevo Invitado
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorFormulario && (
                <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-100">
                  {errorFormulario}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-[#185FA5]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Tipo de Dieta
                </label>
                <select
                  name="dietTypeId"
                  value={formData.dietTypeId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                >
                  <option value="1">Estándar</option>
                  <option value="2">Vegetariano</option>
                  <option value="3">Vegano</option>
                  <option value="4">Celíaco</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-50 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoInvitado}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#185FA5] hover:bg-[#0C447C] rounded-xl"
                >
                  {guardandoInvitado ? "Guardando..." : "Guardar Invitado"}
                </button>
              </div>
            </form>
          </div>
        </div>

      )}

     
      {/* MODAL DE ASIGNAR MESA (click o arrastrar y soltar) */}
{showAssignModal && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    
<div className="bg-white rounded-3xl w-full max-w-[95vw] h-[92vh] shadow-2xl flex flex-col overflow-hidden">      {/* HEADER */}
      <div className="p-6 pb-3">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#0C447C]">
              Asignar Mesa
            </h2>

            <p className="text-slate-500 text-sm mt-1">
              Hacé clic en una mesa o arrastrá el invitado para asignarlo a:
              <span className="font-semibold text-[#185FA5] ml-2">
                {guestSelected?.fullName}
              </span>
            </p>
          </div>

          <button
            onClick={() => {
              setShowAssignModal(false);
              setGuestSelected(null);
              setDraggingGuest(false);
              setHoveredMesaId(null);
            }}
            className="text-2xl text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>

        {/* INVITADO ARRASTRABLE */}
        {guestSelected && (
          <div className="flex justify-center mb-4">
            <div
              onMouseDown={handleGuestMouseDown}
              className={`
                bg-[#185FA5]
                text-white
                px-5
                py-3
                rounded-2xl
                shadow-lg
                select-none
                text-base
                font-semibold
                transition-opacity
                ${draggingGuest ? "opacity-40 cursor-grabbing" : "cursor-grab"}
              `}
            >
              {guestSelected.fullName}
            </div>
          </div>
        )}
      </div>

      {/* DIAGRAMA */}
  <div
  ref={assignContainerRef}
  className="relative flex-1 overflow-auto bg-gray-100"
  onMouseMove={handleContainerMouseMove}
  onMouseUp={handleContainerMouseUp}
  onMouseLeave={handleContainerMouseUp}
>
  {!diagram ? (
    <div className="flex items-center justify-center h-full text-slate-400">
      Cargando diagrama...
    </div>
  ) : (
<div
  className="relative w-full h-full flex items-center justify-center"
    ref={canvasRef}
  style={{
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    margin: "0 auto", 
  }}
>
      {/* PLANO */}
      <img
        ref={imgRef}
        src={diagram}
        className="max-w-full items-center justify-cent max-h-full object-contain"
          draggable={false}
      />

      {/* MESAS */}
      {tables.map((mesa) => {
        const isCircle = mesa.shapeId === 1;
        const mesaLlena =
          (mesa.guests?.length ?? 0) >= mesa.capacity;

        return (
          <div
            key={mesa.id}
            onMouseEnter={() => setHoveredMesaId(mesa.id)}
            onMouseLeave={() => setHoveredMesaId(null)}
            className="absolute flex items-center justify-center text-xs font-semibold text-white shadow-md cursor-pointer"
            style={{
             left: `${mesa.posX}%`,
              top: `${mesa.posY}%`,
              width: `${mesa.width}%`,
              height: `${mesa.height}%`,
              transform: "translate(-50%, -50%)",

              borderRadius: isCircle ? "50%" : "12px",
              background: mesaLlena
                ? "#dc2626"
                : "linear-gradient(145deg,#1e6bb8,#185FA5)",
              border: "2px solid rgba(255,255,255,0.35)",
              boxShadow: "0 6px 15px rgba(0,0,0,0.25)",
              zIndex: 10,
            }}
          >
            <div className="text-center leading-tight">
              <div>{mesa.tableName}</div>
              <div className="text-[10px]">
                {mesa.guests?.length ?? 0} / {mesa.capacity}
              </div>
            </div>
          </div>
        );
      })}

      {/* DRAG */}
      {draggingGuest && guestSelected && (
        <div
          style={{
            position: "absolute",
            left: dragPos.x,
            top: dragPos.y,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 20,
          }}
          className="bg-[#185FA5] text-white px-4 py-2 rounded-xl shadow-2xl text-sm font-semibold"
        >
          {guestSelected.fullName}
        </div>
      )}
    </div>
  )}
</div>
    </div>
  </div>
)}

</div>
  );

}