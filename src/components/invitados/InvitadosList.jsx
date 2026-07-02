import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { invitadosService } from "../../services/invitadosService";
import { getEvento } from "../../services/eventosService";
import { getTablesByEventId } from "../../services/mesasService";
import { getApiErrorMessage } from "../../utils/apiError";
import { useAuth } from "../../context/AuthContext";
import { canManageEvent } from "../../utils/roles";
import { sendMasiveEmails } from "../../services/emailService";
import ExcelImportModal from "./ExcelImportModal";

const TAMANIO_PAGINA = 10;

export function InvitadosList({ eventId }) {
  const { user, loading: authLoading } = useAuth();

  // Permisos / evento
  const [evento, setEvento] = useState(null);
  const [permisoCargando, setPermisoCargando] = useState(true);
  const [permisoError, setPermisoError] = useState(false);

  // Listado de invitados
  const [invitados, setInvitados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalInvitados, setTotalInvitados] = useState(0);
  const [totalFiltrados, setTotalFiltrados] = useState(0);

  // Búsqueda
  const [busqueda, setBusqueda] = useState("");

  // Menú "Gestionar" (portal)
  const [menuConfig, setMenuConfig] = useState({ id: null, top: 0, left: 0 });

  // Modal "Agregar invitado"
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guardandoInvitado, setGuardandoInvitado] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    dietTypeId: "1",
  });

  // Envío masivo de correos
  const [enviandoCorreos, setEnviandoCorreos] = useState(false);

  // Asignación de mesas
  const [showAsignarMesas, setShowAsignarMesas] = useState(false);
  const [invitadosAll, setInvitadosAll] = useState([]);
  const [mesasAll, setMesasAll] = useState([]);
  const [editModal,setEditModal] = useState(false);
  const [guestSelected, setGuestSelected] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [hoveredMesaId, setHoveredMesaId] = useState(null);

  const puedeGestionar = canManageEvent(user, evento);

  // Cargamos el evento para validar permisos (admin o responsable/propietario)
  useEffect(() => {
    if (!eventId) {
      setPermisoCargando(false);
      return;
    }

    let activo = true;
    setPermisoCargando(true);
    setPermisoError(false);

    getEvento(eventId)
      .then((ev) => {
        if (activo) setEvento(ev);
      })
      .catch((err) => {
        console.error("Error al cargar el evento para permisos:", err);
        if (activo) setPermisoError(true);
      })
      .finally(() => {
        if (activo) setPermisoCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [eventId]);

  const cargarInvitados = async () => {
    try {
      setCargando(true);
      setError(null);

      const respuesta = await invitadosService.getAll(
        eventId,
        paginaActual,
        TAMANIO_PAGINA,
        busqueda,
      );

      if (respuesta) {
        setInvitados(Array.isArray(respuesta.data) ? respuesta.data : []);
        setTotalPaginas(respuesta.totalPages || 1);
        setTotalFiltrados(respuesta.total || 0);

        if (!busqueda) {
          setTotalInvitados(respuesta.total || 0);
        }
      }
    } catch (err) {
      console.error("Error al cargar invitados:", err);
      setError(getApiErrorMessage(err, "No se pudieron cargar los invitados."));
    } finally {
      setCargando(false);
    }
  };

  // Debounce de búsqueda / cambio de página
  useEffect(() => {
    if (!eventId) return;

    const timeoutId = setTimeout(cargarInvitados, 250);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, paginaActual, busqueda]);

  // Cerrar menú "Gestionar" al hacer clic afuera
  useEffect(() => {
    const cerrarMenu = () => setMenuConfig({ id: null, top: 0, left: 0 });
    document.addEventListener("click", cerrarMenu);
    return () => document.removeEventListener("click", cerrarMenu);
  }, []);

  // Bloquear el scroll del body mientras haya algún modal abierto
  useEffect(() => {
    const hayModalAbierto = isModalOpen || showAsignarMesas || showExcelModal;
    if (!hayModalAbierto) return;

    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflowOriginal;
    };
  }, [isModalOpen, showAsignarMesas, showExcelModal]);

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  };

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
      await cargarInvitados();
    } catch (err) {
      setErrorFormulario(getApiErrorMessage(err, "Error al registrar el invitado."));
    } finally {
      setGuardandoInvitado(false);
    }
  };

  const handleBorrar = (invitadoId) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará al invitado permanentemente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#185FA5",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        await invitadosService.delete(eventId, invitadoId);
        await cargarInvitados();

        Swal.fire({
          title: "¡Eliminado!",
          text: "El invitado fue removido con éxito.",
          icon: "success",
          confirmButtonColor: "#185FA5",
        });
      } catch (err) {
        console.error("Error al borrar invitado:", err);

        Swal.fire({
          title: "Error",
          text: getApiErrorMessage(err, "No se pudo eliminar al invitado."),
          icon: "error",
          confirmButtonColor: "#185FA5",
        });
      }
    });
  };

  const cargarDatosAsignacion = async () => {
    const [mesas, invitadosRes] = await Promise.all([
      getTablesByEventId(eventId),
      invitadosService.getAll(eventId, 1, 1000, ""),
    ]);

    setMesasAll(mesas);
    setInvitadosAll(invitadosRes.data || []);
  };

  const handleOpenAsignarMesas = async () => {
    try {
      await cargarDatosAsignacion();
      setShowAsignarMesas(true);
      
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: getApiErrorMessage(err, "No se pudieron cargar datos."),
        icon: "error",
      });
    }
  };

 const asignarInvitadoAMesa = async (invitado, mesa) => {
  try {
    await invitadosService.update(eventId, invitado.id, {
      ...invitado,
      tableId: mesa.id,
    });
    await cargarDatosAsignacion();

    const cambios = {
      tableId: mesa.id,
      tableName: mesa.tableName,
    };

    setInvitados((prev) =>
      prev.map((i) =>
        i.id === invitado.id ? { ...i, ...cambios } : i
      )
    );

    setInvitadosAll((prev) =>
      prev.map((i) =>
        i.id === invitado.id ? { ...i, ...cambios } : i
      )
    );

    Swal.fire({
      title: "Asignado",
      text: `${invitado.fullName} → ${mesa.tableName}`,
      icon: "success",
      confirmButtonColor: "#185FA5",
      customClass: {
        container: "swal-top-z",
      },
    });
    setGuestSelected(null);
    setEditModal(false);

  } catch (err) {
    Swal.fire({
      title: "Error",
      text: getApiErrorMessage(err, "No se pudo asignar."),
      icon: "error",
    });
  }
};

  const handleGenerarInvitacion = (invitado) => {
    const linkInvitacion = `${window.location.origin}/invitacion/${invitado.invitationToken}`;
    navigator.clipboard.writeText(linkInvitacion);

    Swal.fire({
      title: "¡Link Generado!",
      html: `El enlace de invitación para <b>${invitado.fullName}</b> fue copiado al portapapeles.<br/><br/><small class="text-slate-400">${linkInvitacion}</small>`,
      icon: "success",
      confirmButtonColor: "#185FA5",
    });
  };

  const handleEnvioMasivo = () => {
    Swal.fire({
      title: "¿Enviar invitaciones a todos?",
      text: "Se enviará un correo electrónico a todos los invitados que no hayan confirmado.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#185FA5",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, enviar todo",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        setEnviandoCorreos(true);
        await sendMasiveEmails(eventId);

        Swal.fire({
          title: "¡Proceso Completado!",
          text: "Invitaciones enviadas con éxito.",
          icon: "success",
          confirmButtonColor: "#185FA5",
        });

        await cargarInvitados(); // Refresca los estados de la tabla si cambió la condición visual
      } catch (err) {
        console.error(
          "Error al enviar correos a los invitados, revise si asigno las mesas a todos los invitados:",
          err,
        );
        Swal.fire({
          title: "Error de envío",
          text:
            err.response?.data?.message ||
            "Ocurrió un error inesperado al despachar las invitaciones.",
          icon: "error",
          confirmButtonColor: "#185FA5",
        });
      } finally {
        setEnviandoCorreos(false);
      }
    });
  };

  const abrirMenuGestionar = (e, invitadoId) => {
    e.stopPropagation();

    if (menuConfig.id === invitadoId) {
      setMenuConfig({ id: null, top: 0, left: 0 });
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setMenuConfig({
      id: invitadoId,
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX - 96,
    });
  };

  // --- Estados de carga / permisos ---

  if (authLoading || permisoCargando) {
    return <p className="text-slate-500 text-sm py-4 animate-pulse">Cargando…</p>;
  }

  if (!puedeGestionar) {
    if (permisoError) {
      return (
        <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <p className="text-slate-700 font-semibold">No se pudo verificar tu acceso</p>
          <p className="text-slate-400 text-sm mt-1">
            Hubo un problema al cargar el evento. Recargá la página e intentá de nuevo.
          </p>
        </div>
      );
    }

    return (
      <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        <p className="text-slate-700 font-semibold">Acceso restringido</p>
        <p className="text-slate-400 text-sm mt-1">
          Solo un administrador o el responsable del evento puede administrar la lista de
          invitados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0C447C] mb-1 tracking-tight">Invitados</h2>
          <p className="text-slate-500 text-sm">
            {busqueda ? (
              <>
                Encontrados{" "}
                <span className="font-semibold text-slate-700">{totalFiltrados}</span> resultados
                de un total de {totalInvitados} invitados.
              </>
            ) : (
              <>
                Tienes <span className="font-semibold text-slate-700">{totalInvitados}</span>{" "}
                invitados registrados.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs">
          <button
            onClick={handleOpenAsignarMesas}
            className="bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm inline-flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            Asignar mesas
          </button>

          <button
            onClick={handleEnvioMasivo}
            disabled={enviandoCorreos || invitados.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 hover:shadow-md hover:-translate-y-0.5 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm inline-flex items-center gap-2"
          >
            {enviandoCorreos ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            )}
            {enviandoCorreos ? "Enviando..." : "Enviar correos a todos"}
          </button>

          <button
            onClick={() => setShowExcelModal(true)}
            className="bg-white hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5 text-[#185FA5] text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm border border-[#185FA5]/20 inline-flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Carga masiva Excel
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#185FA5] hover:bg-[#0C447C] hover:shadow-md hover:-translate-y-0.5 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm inline-flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Agregar Invitado
          </button>
        </div>
      </div>

      {/* BÚSQUEDA */}
      <div className="max-w-md">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar invitado por nombre..."
            value={busqueda}
            onChange={handleBusquedaChange}
            className="w-full px-4 py-2.5 pl-10 border border-slate-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:border-[#185FA5] focus:ring-2 focus:ring-[#185FA5]/10 transition-shadow text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      {/* TABLA / CONTENIDO */}
      {cargando ? (
        <p className="text-slate-500 text-sm py-4 animate-pulse">Cargando invitados...</p>
      ) : error ? (
        <p className="text-red-500 text-sm py-4">{error}</p>
      ) : invitados.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <p className="text-slate-400 text-sm">No hay invitados registrados en este evento.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-slate-700 uppercase text-xs font-semibold tracking-wider">
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
                    <tr key={invitado.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 shrink-0 rounded-full bg-[#185FA5]/10 text-[#185FA5] text-xs font-semibold flex items-center justify-center">
                            {invitado.fullName?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-slate-900">{invitado.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900 text-xs font-medium">
                          {invitado.email || "-"}
                        </div>
                        <div className="text-slate-400 text-xs">{invitado.phone || "-"}</div>
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
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            invitado.guestStatusId === 2
                              ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                              : invitado.guestStatusId === 3
                                ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                                : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              invitado.guestStatusId === 2
                                ? "bg-green-500"
                                : invitado.guestStatusId === 3
                                  ? "bg-red-500"
                                  : "bg-amber-500"
                            }`}
                          />
                          {invitado.guestStatusName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => abrirMenuGestionar(e, invitado.id)}
                          className="text-xs font-medium text-[#185FA5] hover:text-[#0C447C] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all inline-flex items-center gap-1"
                        >
                          Gestionar <span className="text-[10px]">▼</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINACIÓN */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-sm text-slate-500">
              Página <span className="font-medium text-slate-700">{paginaActual}</span> de{" "}
              {totalPaginas}
            </p>
            <div className="inline-flex space-x-2">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => p - 1)}
                className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-40 disabled:hover:bg-white inline-flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </button>
              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual((p) => p - 1)}
                className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-40 disabled:hover:bg-white inline-flex items-center gap-1"
              >
                Siguiente
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL: AGREGAR INVITADO */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 h-screen w-screen bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-fade-in my-8">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#0C447C]">Nuevo Invitado</h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 h-8 w-8 rounded-full text-xl font-bold flex items-center justify-center transition-colors"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5]"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#185FA5]"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#185FA5]"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#185FA5]"
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
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardandoInvitado}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#185FA5] hover:bg-[#0C447C] rounded-xl transition-colors disabled:opacity-50"
                  >
                    {guardandoInvitado ? "Guardando..." : "Guardar Invitado"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* MODAL: ASIGNAR MESAS */}
      {showAsignarMesas &&
        createPortal(
          <div className="fixed inset-0 h-screen w-screen bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] overflow-y-auto">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in my-8">
              <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                <h2 className="font-semibold text-lg text-[#0C447C]">Asignar mesas</h2>
                <button
                  onClick={() => setShowAsignarMesas(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 h-8 w-8 rounded-full text-xl flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 h-[500px]">
                {/* INVITADOS SIN MESA */}
                <div className="border border-slate-200 rounded-xl p-3 overflow-auto bg-slate-50/40">
                  <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">
                    Invitados sin mesa
                  </h3>

                  {(invitadosAll.filter((inv) => !inv.tableId).length === 0 && editModal == false)  ? (
                    <p className="text-sm text-slate-400 italic">
                      Todos los invitados tienen mesa asignada.
                    </p>
                  ) : (
                   (editModal == true) ? (
                    invitadosAll
                      .filter((inv) => guestSelected?.id == inv.id)
                      .map((inv) => (
                        <div
                          key={inv.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("invitadoId", inv.id);
                            setDraggingId(inv.id);
                          }}
                          onDragEnd={() => setDraggingId(null)}
                          className={`px-3 py-2 mb-2 rounded-lg border cursor-grab active:cursor-grabbing shadow-sm transition-all ${
                            draggingId === inv.id
                              ? "opacity-40 scale-95"
                              : guestSelected?.id === inv.id
                                ? "bg-indigo-100 border-indigo-300"
                                : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow"
                          }`}
                        >
                          {inv.fullName}
                        </div>
                      ))
                   ):(
                      invitadosAll
                      .filter((inv) => !inv.tableId)
                      .map((inv) => (
                        <div
                          key={inv.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("invitadoId", inv.id);
                            setDraggingId(inv.id);
                          }}
                          onDragEnd={() => setDraggingId(null)}
                          className={`px-3 py-2 mb-2 rounded-lg border cursor-grab active:cursor-grabbing shadow-sm transition-all ${
                            draggingId === inv.id
                              ? "opacity-40 scale-95"
                              : guestSelected?.id === inv.id
                                ? "bg-indigo-100 border-indigo-300"
                                : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow"
                          }`}
                        >
                          {inv.fullName}
                        </div>
                      ))
                   )
                    
                  )}
                </div>

                {/* MESAS */}
                <div className="border border-slate-200 rounded-xl p-3 overflow-auto bg-slate-50/40">
                  <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">
                    Mesas
                  </h3>

                  {mesasAll.map((mesa) => {
                    const ocupados = mesa.guests?.length || 0;
                    const llena = ocupados >= mesa.capacity;

                    return (
                      <div
                        key={mesa.id}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setHoveredMesaId(mesa.id);
                        }}
                        onDrop={(e) => {
                            e.preventDefault();

                            const invitadoId = e.dataTransfer.getData("invitadoId");
                            if (!invitadoId) return;

                            const invitado = invitadosAll.find(
                              (i) => i.id.toString() === invitadoId.toString()
                            );

                            if (invitado) {
                              asignarInvitadoAMesa(invitado, mesa);
                            }

                            setHoveredMesaId(null);
                          }}
                        onDragLeave={() => setHoveredMesaId(null)}
                        className={`p-3 mb-2 border rounded-xl shadow-sm transition-all ${
                          llena
                            ? "bg-red-50 border-red-200"
                            : hoveredMesaId === mesa.id
                              ? "bg-indigo-100 border-indigo-400 ring-2 ring-indigo-300"
                              : "bg-white border-slate-200 hover:bg-blue-50/60"
                        }`}
                      >
                        <div className="font-medium flex justify-between text-slate-700">
                          <span>{mesa.tableName}</span>
                          <span className="text-xs text-slate-500">
                            {ocupados}/{mesa.capacity}
                          </span>
                        </div>

                        {llena && <p className="text-xs text-red-500 mt-1">Mesa completa</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* MENÚ "GESTIONAR" (PORTAL) */}
      {menuConfig.id &&
        createPortal(
          <div
            className="absolute w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-[9999] text-left text-sm animate-fade-in"
            style={{ top: menuConfig.top, left: menuConfig.left }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const invitado = invitados.find((i) => i.id === menuConfig.id);
              if (!invitado) return null;

              return (
                <>
                  <button
                    onClick={() => {
                      handleGenerarInvitacion(invitado);
                      setMenuConfig({ id: null, top: 0, left: 0 });
                    }}
                    className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5"
                      />
                    </svg>
                    Generar Invitación
                  </button>


                  <button
                    onClick={() => {
                      const invitado = invitados.find((i) => i.id === menuConfig.id);
                      setGuestSelected(invitado);
                      setEditModal(true);
                      handleOpenAsignarMesas();                      
                      setMenuConfig({ id: null, top: 0, left: 0 });
                    }}
                    className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Actualizar mesa
                  </button>

                  <hr className="border-slate-100 my-1" />
                  <button
                    onClick={() => {
                      handleBorrar(invitado.id);
                      setMenuConfig({ id: null, top: 0, left: 0 });
                    }}
                    className="w-full px-4 py-2 hover:bg-red-50 text-red-600 font-medium flex items-center gap-2 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9.5 4h5l.5 3h-6l.5-3z"
                      />
                    </svg>
                    Borrar
                  </button>

                  


                </>
              );
            })()}
          </div>,
          document.body,
        )}

      {/* MODAL: CARGA MASIVA EXCEL */}
      {showExcelModal && (
        <ExcelImportModal
          eventId={eventId}
          onClose={() => setShowExcelModal(false)}
          onSuccess={(result) => {
            setShowExcelModal(false);
            Swal.fire({
              icon: "success",
              title: "¡Importación completada!",
              text: `Se importaron ${result.totalImported} invitados con éxito.`,
              confirmButtonColor: "#185FA5",
            });
            cargarInvitados();
          }}
        />
      )}
    </div>
  );
}