import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { differenceInDays, parseISO } from "date-fns";
import { getEvento, getSalonDiagram } from "../../services/eventosService";
import { getAllTypes } from "../../services/eventTypeService";
import {
  CreateEventSchedule,
  deleteEventSchedule,
  getAllEventSchedule,
  updateEventSchedule,
} from "../../services/eventScheduleService";
import { getTablesByEventId } from "../../services/mesasService";
import { updateTableLayout } from "../../services/mesasService";
import { createTable } from "../../services/mesasService";
import { errorToast, successToast } from "../../globals/toast";
import { InvitadosList } from "../../components/invitados/InvitadosList";
import { obtenerProveedores, obtenerSeleccionCatering,getProvidersBySalonId } from "../../services/proveedoresService";
import { invitadosService } from "../../services/invitadosService";
import {
  asignarProveedorAActividad,
  desasignarProveedorDeActividad,
  obtenerProveedoresDeActividad,
} from "../../services/eventProvidersService";

const getScheduleId = (activity) =>
  activity?.id ?? activity?.eventScheduleId ?? activity?.EventScheduleId;

const toTimeInput = (time) => (time ? String(time).slice(0, 5) : "");

const toApiTime = (time) => (time?.length === 5 ? `${time}:00` : time);

const MAPA_RUBROS = {
  1: "DJ",
  2: "Catering",
  3: "Fotografía",
  4: "Decoración",
  5: "Animación",
  6: "Iluminación",
  7: "Sonido",
};

export default function EventoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tiposEvento, setTiposEvento] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [errorTipos, setErrorTipos] = useState(null);

  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [seccion, setSeccion] = useState("resumen");
  const [confirmados, setConfirmados] = useState(0);

  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [errorSchedules, setErrorSchedules] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [scheduleActionId, setScheduleActionId] = useState(null);

  const [diagram, setDiagram] = useState(null);
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [errorTables, setErrorTables] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const containerRef = useRef(null);
  const [resizingId, setResizingId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateActivity, setShowCreateActivity] = useState(false);

  const [newTable, setNewTable] = useState({
    tableName: "Mesa Principal",
    capacity: 10,
    shapeId: 2,
    width: 20,
    height: 20,
    posX: 5,
    posY: 10,
  });
  const [newActivity, setNewActivity] = useState({
    title: "Mesa dulce",
    description: "Se preparará la mesa dulce",
    startTime: "03:00:00",
    endTime: "03:00:00",
  });

  const [todosProveedores, setTodosProveedores] = useState([]);
  const [loadingTodosProveedores, setLoadingTodosProveedores] = useState(false);
  const [cateringSeleccionado, setCateringSeleccionado] = useState(null);
  const [cateringSummary, setCateringSummary] = useState([]);
  const [loadingCateringSummary, setLoadingCateringSummary] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchCatering = async () => {
      try {
        const { data } = await obtenerSeleccionCatering(id);
        setCateringSeleccionado(data);
      } catch (err) {
        console.error("Error al cargar seleccion de catering", err);
      }
    };
    fetchCatering();
  }, [id, seccion]);

  useEffect(() => {
    if (!id || seccion !== "catering") return;
    const fetchCateringSummary = async () => {
      setLoadingCateringSummary(true);
      try {
        const data = await invitadosService.getCateringSummary(id);
        setCateringSummary(data || []);
      } catch (err) {
        console.error("Error al cargar resumen de catering", err);
      } finally {
        setLoadingCateringSummary(false);
      }
    };
    fetchCateringSummary();
  }, [id, seccion]);

  useEffect(() => {
    if (seccion !== "servicios" && seccion !== "editar" && seccion !== "cronograma") return;
    const fetchTodosProveedores = async () => {
      setLoadingTodosProveedores(true);
      try {
        const { data } = await getProvidersBySalonId(evento.salonId);
        setTodosProveedores(data || data || []);
      } catch (err) {
        console.error("Error al cargar todos los proveedores", err);
      } finally {
        setLoadingTodosProveedores(false);
      }
    };
    fetchTodosProveedores();
  }, [seccion]);

  const handleAsignarProveedor = async (activityId, providerId) => {
    try {
      await asignarProveedorAActividad(activityId, providerId);
      successToast("Proveedor asignado con éxito");
      await loadSchedules();
    } catch (err) {
      errorToast("No se pudo asignar el proveedor", err.message || "Error desconocido");
    }
  };

  const handleDesasignarProveedor = async (assignmentId) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas desvincular a este proveedor de la actividad?");
    if (!confirmar) return;

    try {
      await desasignarProveedorDeActividad(assignmentId);
      successToast("Proveedor desvinculado con éxito");
      await loadSchedules();
    } catch (err) {
      errorToast("No se pudo desvincular el proveedor", err.message || "Error desconocido");
    }
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setTables((prev) =>
        prev.map((t) => {
          if (t.id !== draggingId && t.id !== resizingId) return t;

          // MOVIMIENTO
          if (draggingId && t.id === draggingId) {
            return {
              ...t,
              posX: Math.max(0, Math.min(100, x)),
              posY: Math.max(0, Math.min(100, y)),
            };
          }

          // RESIZE
          if (resizingId && t.id === resizingId) {
            return {
              ...t,
              width: Math.max(3, x - t.posX),
              height: Math.max(3, y - t.posY),
            };
          }

          return t;
        }),
      );
    },
    [draggingId, resizingId],
  );

  const handleCreateTable = async () => {
    try {
      const mesaCreada = await createTable(id, {
        tableName: newTable.tableName,
        capacity: Number(newTable.capacity),
        shapeId: Number(newTable.shapeId),
        width: Number(newTable.width),
        height: Number(newTable.height),
        posX: Number(newTable.posX),
        posY: Number(newTable.posY),
      });

      setTables((prev) => [...prev, mesaCreada]);

      setShowCreateModal(false);

      setNewTable({
        tableName: "Mesa Principal",
        capacity: 10,
        shapeId: 2,
        width: 20,
        height: 20,
        posX: 5,
        posY: 10,
      });

      successToast("Mesa creada con éxito");
    } catch (err) {
      console.error("Error creando mesa", err);
    }
  };

  const handleCreateActivity = async () => {
    try {
      await CreateEventSchedule({
        id: id,
        title: newActivity.title,
        description: newActivity.description,
        startTime: newActivity.startTime,
        endTime: newActivity.endTime,
      });

      setShowCreateActivity(false);
      await loadSchedules();

      setNewActivity({
        title: "Mesa dulce",
        description: "Se preparará la mesa dulce",
        startTime: "03:00:00",
        endTime: "03:00:00",
      });

      successToast("Actividad creada con éxito");
    } catch (err) {
      errorToast("No se pudo crear la actividad", err.message);
    }
  };

  useEffect(() => {
    if (!id) return;

    async function loadTables() {
      setLoadingTables(true);
      setErrorTables(null);

      try {
        const res = await getTablesByEventId(id);
        setTables(Array.isArray(res) ? res : res?.data ?? res?.value ?? []);
      } catch (e) {
        setTables([]);
        setErrorTables(
          e.code === "ERR_NETWORK"
            ? "No se pudo conectar con el servicio de mesas. Verificá que esté iniciado y que la URL configurada sea correcta."
            : "No se pudieron cargar las mesas de este evento.",
        );
      } finally {
        setLoadingTables(false);
      }
    }

    loadTables();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    getSalonDiagram(id).then(setDiagram).catch(console.error);
  }, [id]);

  const handleMouseUp = useCallback(async () => {
    const mesa = tables.find((t) => t.id === (draggingId || resizingId));
    if (!mesa) return;

    setDraggingId(null);
    setResizingId(null);

    try {
      await updateTableLayout(id, mesa.id, {
        posX: Number(mesa.posX),
        posY: Number(mesa.posY),
        width: Number(mesa.width),
        height: Number(mesa.height),
      });
    } catch (err) {
      console.error("Error guardando layout", err);
    }
  }, [draggingId, resizingId, tables, id]);

  useEffect(() => {
    let cancelado = false;

    async function cargarTipos() {
      setLoadingTipos(true);
      setErrorTipos(null);

      try {
        const data = await getAllTypes();

        if (!cancelado) {
          setTiposEvento(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelado) {
          setErrorTipos(err.message);
        }
      } finally {
        if (!cancelado) {
          setLoadingTipos(false);
        }
      }
    }

    cargarTipos();

    return () => {
      cancelado = true;
    };
  }, []);

  const diasFaltantes = useMemo(() => {
    if (!evento?.eventDate) return 0;

    const fechaEvento = parseISO(evento.eventDate);
    const hoy = new Date();

    const dias = differenceInDays(fechaEvento, hoy);

    return dias < 0 ? 0 : dias;
  }, [evento]);

  const tipoEvento = useMemo(() => {
    if (!evento) return null;

    return tiposEvento.find(
      (t) =>
        t.id === evento.eventTypeId || t.eventTypeId === evento.eventTypeId,
    );
  }, [evento, tiposEvento]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const data = await getEvento(id);

        if (!cancelled) {
          setEvento(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Error al cargar el evento");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadSchedules = useCallback(async () => {
    setLoadingSchedules(true);
    setErrorSchedules(null);

    try {
      const data = await getAllEventSchedule(id);
      const items = Array.isArray(data)
        ? data
        : data?.data ?? data?.value ?? data?.items ?? [];
      
      const itemsConProveedores = await Promise.all(
        items.map(async (item) => {
          const activityId = getScheduleId(item);
          if (!activityId) return { ...item, providers: [] };
          try {
            const res = await obtenerProveedoresDeActividad(activityId);
            const provs = (res.data || []).map(p => ({
              ...p,
              name: p.providerName || p.name
            }));
            return {
              ...item,
              providers: provs
            };
          } catch (e) {
            console.error("Error al cargar proveedores de actividad", activityId, e);
            return { ...item, providers: [] };
          }
        })
      );
      setSchedules(itemsConProveedores);
    } catch (scheduleError) {
      setErrorSchedules(scheduleError.message || "No se pudo cargar el cronograma.");
    } finally {
      setLoadingSchedules(false);
    }
  }, [id]);

  useEffect(() => {
    if (seccion !== "cronograma" && seccion !== "editar" && seccion !== "servicios") return;
    loadSchedules();
  }, [loadSchedules, seccion]);

  const openActivityEditor = (activity) => {
    setEditingActivity({
      id: getScheduleId(activity),
      title: activity.title ?? "",
      description: activity.description ?? "",
      startTime: toTimeInput(activity.startTime),
      endTime: toTimeInput(activity.endTime),
    });
  };

 useEffect(() => {
    if (!id) return;

    const loadConfirmados = async () => {
      try {
        const data = await invitadosService.getCateringSummary(id);

        const total = (data || []).reduce(
          (sum, item) => sum + item.totalConfirmed,
          0
        );

        setConfirmados(total);
      } catch (e) {
        console.error(e);
      }
    };

    loadConfirmados();
  }, [id]);

  const handleUpdateActivity = async () => {
    if (!editingActivity?.id) return;

    setScheduleActionId(editingActivity.id);
    try {
      await updateEventSchedule({
        ...editingActivity,
        startTime: toApiTime(editingActivity.startTime),
        endTime: toApiTime(editingActivity.endTime),
      });
      setEditingActivity(null);
      await loadSchedules();
      successToast("Actividad actualizada con éxito");
    } catch (scheduleError) {
      errorToast("No se pudo actualizar la actividad", scheduleError.message);
    } finally {
      setScheduleActionId(null);
    }
  };

  const handleDeleteActivity = async () => {
    const activityId = getScheduleId(activityToDelete);
    if (!activityId) return;

    setScheduleActionId(activityId);
    try {
      await deleteEventSchedule(id, activityId);
      setSchedules((current) =>
        current.filter((item) => getScheduleId(item) !== activityId),
      );
      setActivityToDelete(null);
      successToast("Actividad eliminada con éxito");
    } catch (scheduleError) {
      errorToast("No se pudo eliminar la actividad", scheduleError.message);
    } finally {
      setScheduleActionId(null);
    }
  };

  const toMinutesWithNextDay = (time) => {
    if (!time) return 0;

    const [h, m] = time.split(":").map(Number);
    let minutes = h * 60 + m;
    
    if (h < 6) {
      minutes += 24 * 60;
    }

    return minutes;
  };

  const schedulesOrdenados = useMemo(() => {
    return [...schedules].sort((a, b) => {
      const startDiff =
        toMinutesWithNextDay(a.startTime) - toMinutesWithNextDay(b.startTime);

      if (startDiff !== 0) return startDiff;

      return toMinutesWithNextDay(a.endTime) - toMinutesWithNextDay(b.endTime);
    });
  }, [schedules]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6F1FB]">
      {/* HEADER */}
      <div className="bg-[#0C447C]">
        <div className="max-w-7xl mx-auto px-10 py-10">
          <button
            onClick={() => navigate("/eventos")}
            className="text-[#85B7EB] text-sm mb-6 hover:underline"
          >
            ← Volver a mis eventos
          </button>

          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#85B7EB]">
                Panel de administración
              </span>

              <h1 className="text-4xl font-semibold text-white mt-2">
                {evento.eventName}
              </h1>

              <p className="text-[#B5D4F4] mt-3">
                {diasFaltantes > 0
                  ? `Faltan ${diasFaltantes} días para tu evento`
                  : "Tu evento es hoy"}
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm">
              <div className="text-xs text-[#85B7EB] uppercase">Fecha</div>

              <div className="text-white text-xl font-semibold mt-1">
                {evento.eventDate}
              </div>

              <div className="text-[#B5D4F4] mt-1">
                {evento.eventStart.slice(0, 5)} -{" "}
                {evento.eventFinish.slice(0, 5)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="max-w-7xl mx-auto px-10 py-10">
        <div className="grid grid-cols-[260px_1fr] gap-8">
          {/* SIDEBAR */}
          <aside className="bg-white rounded-3xl shadow-sm p-4 h-fit">
            <h2 className="text-[#0C447C] font-semibold mb-4">
              Administración
            </h2>

            <nav className="flex flex-col gap-2">
              <button
                onClick={() => setSeccion("resumen")}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === "resumen"
                    ? "bg-[#185FA5] text-white"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Resumen
              </button>

              <button
                onClick={() => setSeccion("invitados")}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === "invitados"
                    ? "bg-[#185FA5] text-white"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Invitados
              </button>

              <button
                onClick={() => setSeccion("mesas")}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === "mesas"
                    ? "bg-[#185FA5] text-white"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Mesas
              </button>

              <button
                onClick={() => setSeccion("servicios")}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === "servicios"
                    ? "bg-[#185FA5] text-white"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Servicios contratados
              </button>

              <button
                onClick={() => setSeccion("catering")}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === "catering"
                    ? "bg-[#185FA5] text-white"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Catering
              </button>

              <button
                onClick={() => setSeccion("cronograma")}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === "cronograma"
                    ? "bg-[#185FA5] text-white"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Ver cronograma
              </button>

              <button
                onClick={() => setSeccion("editar")}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  seccion === "editar"
                    ? "bg-[#185FA5] text-white"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Editar cronograma
              </button>
            </nav>
          </aside>

          {/* MAIN */}
          <main>
            {/* CARDS */}
            <div className="grid md:grid-cols-4 gap-5 mb-8">
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">Días restantes</p>

                <h3 className="text-4xl font-bold text-[#0C447C] mt-3">
                  {diasFaltantes}
                </h3>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">Invitados</p>

                <h3 className="text-4xl font-bold text-[#0C447C] mt-3">
                  {evento.estimedGuests}
                </h3>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">Servicios</p>

                <h3 className="text-4xl font-bold text-[#0C447C] mt-3">
                  {evento.providersIds.length}
                </h3>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">Confirmados</p>

                <h3 className="text-4xl font-bold text-[#0C447C] mt-3">
                  {confirmados}
                </h3>
              </div>
            </div>

            {/* PANEL */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              {seccion === "resumen" && (
                <>
                  <h2 className="text-2xl font-semibold text-[#0C447C] mb-6">
                    Resumen del evento
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="rounded-2xl bg-[#F8FBFF] p-6 border border-[#D9EAFB]">
                      <h3 className="font-semibold text-[#0C447C] mb-3">
                        Información general
                      </h3>

                      <div className="space-y-2 text-slate-600">
                        <p>
                          <strong>Evento:</strong> {evento.eventName}
                        </p>

                        <p>
                          <strong>Fecha:</strong> {evento.eventDate}
                        </p>

                        <p>
                          <strong>Horario:</strong>{" "}
                          {evento.eventStart.slice(0, 5)}
                          {" - "}
                          {evento.eventFinish.slice(0, 5)}
                        </p>

                        <p>
                          <strong>Invitados:</strong> {evento.estimedGuests}
                        </p>

                        <p>
                          <strong>Catering:</strong>{" "}
                          {cateringSeleccionado ? (
                            <span className="font-semibold text-[#C9913A]">
                              {cateringSeleccionado.nombreProveedor} ({cateringSeleccionado.nivel.toUpperCase()})
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No seleccionado</span>
                          )}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => navigate(`/eventos/${id}/catering`)}
                          className="w-full text-white text-xs font-semibold py-2 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                          style={{ backgroundColor: '#C9913A' }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b07b2e'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#C9913A'}
                        >
                          🍽️ {cateringSeleccionado ? "Cambiar Catering" : "Seleccionar Catering"}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#F8FBFF] p-6 border border-[#D9EAFB]">
                      <h3 className="font-semibold text-[#0C447C] mb-3">
                        Próximos pasos
                      </h3>

                      <ul className="space-y-3 text-slate-600">
                        <li>• Cargar invitados.</li>
                        <li>• Organizar las mesas.</li>
                        <li>• Contratar servicios.</li>
                        <li>• Completar el cronograma.</li>
                      </ul>
                    </div>
                  </div>
                </>
              )}

              {seccion === "invitados" && (
                <>
                  <div>
                    <InvitadosList eventId={id} />
                  </div>
                </>
              )}

              {seccion === "mesas" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-[#0C447C]">
                      Mesas
                    </h2>

                    <button
                      onClick={() => setShowCreateModal(true)}
                      disabled={Boolean(errorTables)}
                      className="bg-[#185FA5] text-white px-4 py-2 rounded-lg hover:bg-[#0C447C] transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Crear mesa
                    </button>
                  </div>

                  <p className="text-slate-500 mb-4">
                    Vista del plano del salón.
                  </p>

                  {errorTables && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {errorTables}
                    </div>
                  )}

                  <div
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className="relative w-full h-[750px] border-2 rounded-2xl overflow-hidden bg-gray-100"
                  >
                    {!diagram ? (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        Cargando diagrama...
                      </div>
                    ) : (
                      <>
                        {/* MAPA */}
                        <img
                          src={diagram}
                          alt="Diagrama del salón"
                          className="w-full h-full object-contain"
                        />

                        {/* MESAS */}
                        {loadingTables ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-slate-500">
                            Cargando mesas...
                          </div>
                        ) : tables.map((mesa) => {
                          const width = mesa.width || 8;
                          const height = mesa.height || mesa.width || 8;

                          const isCircle = mesa.shapeId === 1;
                          const isRect = mesa.shapeId === 2;

                          return (
                            <div
                              key={mesa.id}
                              onMouseDown={() => setDraggingId(mesa.id)}
                              className="absolute flex items-center justify-center text-xs font-semibold text-white select-none cursor-move shadow-md"
                              style={{
                                left: `${mesa.posX}%`,
                                top: `${mesa.posY}%`,

                                width: `${width}%`,
                                height: `${height}%`,

                                transform: "translate(-50%, -50%)",

                                borderRadius: isCircle ? "50%" : "12px",

                                background:
                                  "linear-gradient(145deg, #1e6bb8, #185FA5)",
                                border: "2px solid rgba(255,255,255,0.35)",
                                boxShadow: "0 6px 15px rgba(0,0,0,0.25)",
                              }}
                            >
                              {mesa.tableName}
                              <br />
                              {"Asientos: "}
                              {mesa.capacity}
                              {/* RESIZE HANDLE */}
                              <div
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  setResizingId(mesa.id);
                                }}
                                className="absolute bottom-0 right-0 w-3 h-3 bg-white border border-[#185FA5] cursor-se-resize rounded-sm"
                              />
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>

                  {showCreateModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                      <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-xl">
                        <h2 className="text-2xl font-semibold text-[#0C447C] mb-6">
                          Crear mesa
                        </h2>

                        <div className="space-y-4">
                          {/* Nombre */}
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                              Nombre
                            </label>
                            <input
                              type="text"
                              value={newTable.tableName}
                              onChange={(e) =>
                                setNewTable({
                                  ...newTable,
                                  tableName: e.target.value,
                                })
                              }
                              className="w-full border rounded-xl px-4 py-2"
                            />
                          </div>

                          {/* Capacidad */}
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                              Capacidad
                            </label>
                            <input
                              type="number"
                              value={newTable.capacity}
                              onChange={(e) =>
                                setNewTable({
                                  ...newTable,
                                  capacity: Number(e.target.value),
                                })
                              }
                              className="w-full border rounded-xl px-4 py-2"
                            />
                          </div>

                          {/* Forma */}
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                              Forma
                            </label>

                            <select
                              value={newTable.shapeId}
                              onChange={(e) =>
                                setNewTable({
                                  ...newTable,
                                  shapeId: Number(e.target.value),
                                })
                              }
                              className="w-full border rounded-xl px-4 py-2"
                            >
                              <option value={1}>Circular</option>
                              <option value={2}>Rectangular</option>
                            </select>
                          </div>

                          {/* Tamaño */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-600 mb-1">
                                Ancho (%)
                              </label>

                              <input
                                type="number"
                                value={newTable.width}
                                onChange={(e) =>
                                  setNewTable({
                                    ...newTable,
                                    width: Number(e.target.value),
                                  })
                                }
                                className="w-full border rounded-xl px-4 py-2"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-600 mb-1">
                                Alto (%)
                              </label>

                              <input
                                type="number"
                                value={newTable.height}
                                onChange={(e) =>
                                  setNewTable({
                                    ...newTable,
                                    height: Number(e.target.value),
                                  })
                                }
                                className="w-full border rounded-xl px-4 py-2"
                              />
                            </div>
                          </div>

                          {/* Posición */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-600 mb-1">
                                Posición X (%)
                              </label>

                              <input
                                type="number"
                                value={newTable.posX}
                                onChange={(e) =>
                                  setNewTable({
                                    ...newTable,
                                    posX: Number(e.target.value),
                                  })
                                }
                                className="w-full border rounded-xl px-4 py-2"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-600 mb-1">
                                Posición Y (%)
                              </label>

                              <input
                                type="number"
                                value={newTable.posY}
                                onChange={(e) =>
                                  setNewTable({
                                    ...newTable,
                                    posY: Number(e.target.value),
                                  })
                                }
                                className="w-full border rounded-xl px-4 py-2"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end gap-3 mt-8">
                          <button
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 rounded-xl border border-slate-300"
                          >
                            Cancelar
                          </button>

                          <button
                            onClick={() => {
                              handleCreateTable();
                              setShowCreateModal(false);
                            }}
                            className="bg-[#185FA5] text-white px-5 py-2 rounded-xl hover:bg-[#0C447C]"
                          >
                            Crear
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {seccion === "servicios" && (
                <>
                  <h2 className="text-2xl font-semibold text-[#0C447C] mb-2">
                    Servicios y Proveedores Contratados
                  </h2>
                  <p className="text-slate-500 mb-6">
                    Asigna y desvincula proveedores para las distintas actividades del cronograma de tu evento.
                  </p>

                  {loadingSchedules || loadingTodosProveedores ? (
                    <p className="text-slate-500">Cargando servicios y actividades...</p>
                  ) : schedulesOrdenados.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#B5D4F4] bg-[#F8FBFF] p-8 text-center">
                      <p className="text-slate-600 mb-4">
                        El evento todavía no tiene actividades programadas en el cronograma.
                      </p>
                      <button
                        onClick={() => setSeccion("cronograma")}
                        className="bg-[#185FA5] text-white px-4 py-2 rounded-xl hover:bg-[#0C447C] transition font-medium text-sm"
                      >
                        Ir a crear actividades
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {schedulesOrdenados.map((actividad) => {
                        const activityId = getScheduleId(actividad);
                        // Filtrar los proveedores que no han sido asignados aún a esta actividad
                        const provsDisponibles = todosProveedores.filter(
                          (p) => !actividad.providers?.some((ap) => ap.providerId === p.id)
                        );

                        return (
                          <div
                            key={activityId}
                            className="bg-white rounded-2xl border border-[#D6E8F8] shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1.5">
                                <h3 className="font-semibold text-[#0C447C] text-lg">
                                  {actividad.title}
                                </h3>
                                <span className="text-xs font-medium text-[#185FA5] bg-[#E6F1FB] px-2.5 py-1 rounded-full">
                                  {toTimeInput(actividad.startTime)} - {toTimeInput(actividad.endTime)}
                                </span>
                              </div>
                              <p className="text-slate-600 text-sm mb-4">
                                {actividad.description || "Sin descripción"}
                              </p>

                              <div className="space-y-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                                  Proveedores asignados:
                                </span>
                                {actividad.providers && actividad.providers.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {actividad.providers.map((p) => (
                                      <div
                                        key={p.id}
                                        className="inline-flex items-center gap-1.5 bg-[#E6F1FB] text-[#185FA5] text-xs font-medium pl-3 pr-1.5 py-1 rounded-full border border-blue-100"
                                      >
                                        <span>{p.name}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleDesasignarProveedor(p.id)}
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]"
                                          title="Desvincular"
                                        >
                                          &times;
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">
                                    No hay proveedores asignados a esta actividad.
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Selector para asignar un proveedor */}
                            <div className="w-full md:w-64 bg-[#F8FBFF] border border-[#D9EAFB] rounded-xl p-4 flex flex-col gap-3">
                              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Vincular nuevo proveedor
                              </span>
                              {provsDisponibles.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                  <select
                                    id={`select-prov-${activityId}`}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#185FA5]"
                                    defaultValue=""
                                  >
                                    <option value="" disabled>
                                      Seleccionar proveedor...
                                    </option>
                                    {provsDisponibles.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.name} ({p.providerTypeName || "Proveedor"})
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => {
                                      const select = document.getElementById(`select-prov-${activityId}`);
                                      if (select && select.value) {
                                        handleAsignarProveedor(activityId, Number(select.value));
                                        select.value = "";
                                      }
                                    }}
                                    className="w-full bg-[#185FA5] hover:bg-[#0C447C] text-white py-1.5 rounded-lg text-xs font-medium transition"
                                  >
                                    Vincular
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">
                                  Todos los proveedores ya fueron asignados.
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {seccion === "catering" && (
                <>
                  <h2 className="text-2xl font-semibold text-[#0C447C] mb-2">
                    Catering y Menús del Evento
                  </h2>
                  <p className="text-slate-500 mb-6">
                    Gestioná la propuesta gastronómica del evento y revisá las preferencias alimenticias de tus invitados.
                  </p>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Tarjeta de Servicio de Catering */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[#0C447C] mb-4 flex items-center gap-2">
                           Propuesta de Catering
                        </h3>

                        {cateringSeleccionado ? (
                          <div className="space-y-4">
                            <div>
                              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Proveedor</span>
                              <p className="text-lg font-bold text-slate-800">{cateringSeleccionado.providerName}</p>
                            </div>

                            <div className="flex gap-4">
                              <div>
                                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Nivel</span>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 uppercase ${
                                  cateringSeleccionado.nivel === "alto" 
                                    ? "bg-amber-100 text-amber-800" 
                                    : cateringSeleccionado.nivel === "medio"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-slate-100 text-slate-800"
                                }`}>
                                  {cateringSeleccionado.nivel}
                                </span>
                              </div>
                              <div>
                                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Precio por Persona</span>
                                <p className="text-lg font-bold text-[#C9913A] mt-0.5">
                                  ${(cateringSeleccionado.price )?.toLocaleString('es-AR')}
                                </p>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 space-y-2">
                              <div className="flex justify-between text-sm text-slate-600">
                                <span>Costo total (confirmados: {cateringSummary.reduce((sum, item) => sum + item.totalConfirmed, 0)}):</span>
                                <span className="font-semibold text-slate-800">
                                  ${(cateringSeleccionado.price * cateringSummary.reduce((sum, item) => sum + item.totalConfirmed, 0)).toLocaleString('es-AR')}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-slate-600">
                                <span>Costo total (estimados: {evento.estimedGuests}):</span>
                                <span className="font-semibold text-slate-800">
                                  ${(cateringSeleccionado.price * evento.estimedGuests).toLocaleString('es-AR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-slate-400 italic mb-4">No has seleccionado ningún catering para este evento.</p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => navigate(`/eventos/${id}/catering`)}
                        className="w-full text-white text-sm font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-sm mt-6"
                        style={{ backgroundColor: '#025896' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3c83cf'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#025896'}
                      >
                         {cateringSeleccionado ? "Cambiar Propuesta de Catering" : "Seleccionar Propuesta de Catering"}
                      </button>
                    </div>

                    {/* Tarjeta de Resumen de Dietas / Menús */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                      <h3 className="text-lg font-semibold text-[#0C447C] mb-4 flex items-center gap-2">
                         Preferencias Alimenticias (Invitados)
                      </h3>

                      {loadingCateringSummary ? (
                        <p className="text-slate-400 italic py-8 text-center animate-pulse">Cargando preferencias...</p>
                      ) : cateringSummary.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-slate-400 italic">No hay invitados confirmados para este evento o no hay preferencias alimenticias registradas.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="overflow-hidden border border-slate-100 rounded-2xl">
                            <table className="w-full text-left text-sm text-slate-600">
                              <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-semibold">
                                <tr>
                                  <th className="px-4 py-3">Tipo de Dieta</th>
                                  <th className="px-4 py-3 text-right">Confirmados</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {cateringSummary.map((item) => (
                                  <tr key={item.dietTypeId} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-800">{item.dietTypeName}</td>
                                    <td className="px-4 py-3 text-right font-bold text-[#185FA5]">{item.totalConfirmed}</td>
                                  </tr>
                                ))}
                                <tr className="bg-slate-50 font-bold text-slate-800">
                                  <td className="px-4 py-3">Total Confirmados</td>
                                  <td className="px-4 py-3 text-right text-[#0C447C]">
                                    {cateringSummary.reduce((sum, item) => sum + item.totalConfirmed, 0)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          
                          <p className="text-xs text-slate-400 italic">
                            * Los datos provienen de las confirmaciones de asistencia enviadas por los invitados.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {seccion === "cronograma" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-[#0C447C]">
                      Cronograma del evento
                    </h2>

                    <button
                      onClick={() => setShowCreateActivity(true)}
                      className="bg-[#185FA5] text-white px-4 py-2 rounded-lg hover:bg-[#0C447C] transition"
                    >
                      Crear actividad
                    </button>
                  </div>

                  {loadingSchedules ? (
                    <p className="text-slate-500">Cargando cronograma...</p>
                  ) : errorSchedules ? (
                    <p className="text-red-500">{errorSchedules}</p>
                  ) : schedulesOrdenados.length === 0 ? (
                    <p className="text-slate-500">
                      El evento todavía no tiene actividades programadas.
                    </p>
                  ) : (
                    <div className="relative ml-4 border-l-2 border-[#B5D4F4] pl-8 space-y-8">
                      {schedulesOrdenados.map((actividad) => (
                        <div key={actividad.id} className="relative">
                          <div className="absolute -left-[42px] top-1 h-5 w-5 rounded-full bg-[#185FA5] border-4 border-[#E6F1FB]" />

                          <div className="bg-white rounded-2xl border border-[#D6E8F8] shadow-sm p-5">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-[#0C447C] text-lg">
                                {actividad.title}
                              </h3>

                              <span className="text-sm font-medium text-[#185FA5] bg-[#E6F1FB] px-3 py-1 rounded-full">
                                {actividad.startTime.slice(0, 5)} -{" "}
                                {actividad.endTime.slice(0, 5)}
                              </span>
                            </div>

                            <p className="text-slate-600 text-sm">
                              {actividad.description}
                            </p>

                            {actividad.providers?.length > 0 && (
                              <div className="mt-4">
                                <p className="text-xs uppercase text-slate-400 mb-2">
                                  Proveedores
                                </p>

                                <div className="flex flex-wrap gap-2">
                                  {actividad.providers.map((p) => (
                                    <span
                                      key={p.id}
                                      className="bg-[#E6F1FB] text-[#185FA5] text-xs px-3 py-1 rounded-full"
                                    >
                                      {p.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {showCreateActivity && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                      <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-xl">
                        <h2 className="text-2xl font-semibold text-[#0C447C] mb-6">
                          Crear actividad
                        </h2>

                        <div className="space-y-4">
                          <input
                            type="text"
                            placeholder="Título"
                            value={newActivity.title}
                            onChange={(e) =>
                              setNewActivity({
                                ...newActivity,
                                title: e.target.value,
                              })
                            }
                            className="w-full border rounded-xl px-4 py-2"
                          />

                          <textarea
                            placeholder="Descripción"
                            value={newActivity.description}
                            onChange={(e) =>
                              setNewActivity({
                                ...newActivity,
                                description: e.target.value,
                              })
                            }
                            className="w-full border rounded-xl px-4 py-2"
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="time"
                              value={newActivity.startTime}
                              onChange={(e) =>
                                setNewActivity({
                                  ...newActivity,
                                  startTime: e.target.value + ":00",
                                })
                              }
                              className="border rounded-xl px-4 py-2"
                            />

                            <input
                              type="time"
                              value={newActivity.endTime}
                              onChange={(e) =>
                                setNewActivity({
                                  ...newActivity,
                                  endTime: e.target.value + ":00",
                                })
                              }
                              className="border rounded-xl px-4 py-2"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                          <button
                            onClick={() => setShowCreateActivity(false)}
                            className="px-4 py-2 rounded-xl border"
                          >
                            Cancelar
                          </button>

                          <button
                            onClick={handleCreateActivity}
                            className="bg-[#185FA5] text-white px-5 py-2 rounded-xl"
                          >
                            Crear
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              {seccion === "editar" && (
                <>
                  <div className="mb-5">
                    <h2 className="text-2xl font-semibold text-[#0C447C]">
                      Editar cronograma
                    </h2>
                  </div>

                  {loadingSchedules ? (
                    <p className="text-slate-500">Cargando cronograma...</p>
                  ) : errorSchedules ? (
                    <p className="text-red-600">{errorSchedules}</p>
                  ) : schedulesOrdenados.length === 0 ? (
                    <p className="text-slate-500">
                      El evento todavía no tiene actividades programadas.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {schedulesOrdenados.map((activity) => {
                        const activityId = getScheduleId(activity);
                        const processing = scheduleActionId === activityId;

                        return (
                          <div
                            key={activityId}
                            className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex flex-wrap items-center gap-3">
                                <h3 className="font-semibold text-[#0C447C]">
                                  {activity.title}
                                </h3>
                                <span className="text-sm font-medium text-[#185FA5]">
                                  {toTimeInput(activity.startTime)} - {toTimeInput(activity.endTime)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600">
                                {activity.description || "Sin descripción"}
                              </p>
                            </div>

                            <div className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={() => openActivityEditor(activity)}
                                disabled={processing}
                                className="rounded-lg border border-[#185FA5] px-3 py-2 text-sm font-medium text-[#185FA5] hover:bg-[#E6F1FB] disabled:opacity-50"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => setActivityToDelete(activity)}
                                disabled={processing}
                                className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                {processing ? "Procesando..." : "Eliminar"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {editingActivity && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="mb-5 text-xl font-semibold text-[#0C447C]">
                          Editar actividad
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                              Título
                            </label>
                            <input
                              value={editingActivity.title}
                              onChange={(event) =>
                                setEditingActivity((current) => ({
                                  ...current,
                                  title: event.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                              Descripción
                            </label>
                            <textarea
                              value={editingActivity.description}
                              onChange={(event) =>
                                setEditingActivity((current) => ({
                                  ...current,
                                  description: event.target.value,
                                }))
                              }
                              rows={3}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-sm font-medium text-slate-700">
                                Hora de inicio
                              </label>
                              <input
                                type="time"
                                value={editingActivity.startTime}
                                onChange={(event) =>
                                  setEditingActivity((current) => ({
                                    ...current,
                                    startTime: event.target.value,
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-medium text-slate-700">
                                Hora de finalización
                              </label>
                              <input
                                type="time"
                                value={editingActivity.endTime}
                                onChange={(event) =>
                                  setEditingActivity((current) => ({
                                    ...current,
                                    endTime: event.target.value,
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setEditingActivity(null)}
                            disabled={Boolean(scheduleActionId)}
                            className="rounded-lg border border-slate-300 px-4 py-2"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleUpdateActivity}
                            disabled={Boolean(scheduleActionId)}
                            className="rounded-lg bg-[#185FA5] px-4 py-2 text-white disabled:opacity-50"
                          >
                            {scheduleActionId ? "Guardando..." : "Guardar cambios"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activityToDelete && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="delete-activity-title"
                    >
                      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3
                          id="delete-activity-title"
                          className="text-xl font-semibold text-slate-900"
                        >
                          Eliminar actividad
                        </h3>
                        <p className="mt-3 text-slate-600">
                          Estás por eliminar la siguiente actividad:
                        </p>
                        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                          <p className="font-semibold text-[#0C447C]">
                            {activityToDelete.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {toTimeInput(activityToDelete.startTime)} - {toTimeInput(activityToDelete.endTime)}
                          </p>
                        </div>
                        <p className="mt-4 text-sm text-slate-500">
                          Esta acción no se puede deshacer.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setActivityToDelete(null)}
                            disabled={Boolean(scheduleActionId)}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteActivity}
                            disabled={Boolean(scheduleActionId)}
                            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {scheduleActionId ? "Eliminando..." : "Confirmar eliminación"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
