import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useHorariosDisponibles } from "../../hooks/useHorariosDisponibles";
import { useBloqueoHorario } from "../../hooks/useBloqueoHorario";
import { createEvento } from "../../services/eventosService";
import { getAllTypes } from "../../services/eventTypeService";
import { getSalons } from "../../services/salonService";
import { calcularMontoTotal } from "../../utils/eventos";
import SelectorHorarios from "../../components/reservas/SelectorHorarios";
import CountdownReserva from "../../components/reservas/CountdownReserva";
import FormularioReserva from "../../components/reservas/FormularioReserva";
import { createReservation } from "../../services/reservationService";
import { errorToast, successToast } from "../../globals/toast";


const PASOS = [
  { id: "tipo", label: "Tipo y salón" },
  { id: "horarios", label: "Horario" },
  { id: "formulario", label: "Datos" },
];
const DURACION_EXITO_MS = 2000;

function calcularExpiracion(segundosRestantes) {
  return new Date(Date.now() + segundosRestantes * 1000).toISOString();
}

function construirCliente(user) {
  if (!user) return null;
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    telefono: user.telefono || "",
  };
}

function getTipoNombre(tipo) {
  return tipo?.name ?? tipo?.nombre ?? `Tipo ${tipo?.id ?? ""}`;
}

function getTipoPrecio(tipo) {
  return Number(tipo?.price ?? tipo?.precioBase ?? tipo?.basePrice ?? 0);
}

function getTipoDuracion(tipo) {
  return Number(
    tipo?.duration ??
    tipo?.duracionMinutos ??
    tipo?.duracionMaximaMinutos ??
    0
  );
}

function Stepper({ pasoActual }) {
  return (
    <ol className="mb-6 flex items-center justify-between gap-2">
      {PASOS.map((p, i) => {
        const activo = i === pasoActual;
        const completado = i < pasoActual;
        return (
          <li key={p.id} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                activo
                  ? "bg-indigo-600 text-white"
                  : completado
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm ${
                activo ? "font-medium text-slate-800" : "text-slate-500"
              }`}
            >
              {p.label}
            </span>
            {i < PASOS.length - 1 && (
              <div
                className={`h-px flex-1 ${
                  completado ? "bg-indigo-300" : "bg-slate-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function EventoNuevoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const fechaSeleccionada = searchParams.get("fecha");

  // ── Tipos de evento ───────────────────────────────────────────────────────
  const [tiposEvento, setTiposEvento] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [errorTipos, setErrorTipos] = useState(null);

  useEffect(() => {
    let cancelado = false;
    async function cargarTipos() {
      setLoadingTipos(true);
      setErrorTipos(null);
      try {
        const data = await getAllTypes();
        if (!cancelado) setTiposEvento(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelado) setErrorTipos(err.message);
      } finally {
        if (!cancelado) setLoadingTipos(false);
      }
    }
    cargarTipos();
    return () => { cancelado = true; };
  }, []);

  // ── Salones ───────────────────────────────────────────────────────────────
  const [salones, setSalones] = useState([]);
  const [loadingSalones, setLoadingSalones] = useState(true);
  const [errorSalones, setErrorSalones] = useState(null);

  useEffect(() => {
    let cancelado = false;
    async function cargarSalones() {
      setLoadingSalones(true);
      setErrorSalones(null);
      try {
        const data = await getSalons();
        if (!cancelado) setSalones(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelado) setErrorSalones(err.message);
      } finally {
        if (!cancelado) setLoadingSalones(false);
      }
    }
    cargarSalones();
    return () => { cancelado = true; };
  }, []);

  // ── Estado del wizard ─────────────────────────────────────────────────────
  const [paso, setPaso] = useState("tipo");
  const [nombreEvento, setNombreEvento] = useState("");
  const [cantInvitados, setCantInvitados] = useState(''); 
  const [tipoEventoId, setTipoEventoId] = useState('');
  const [salonId, setSalonId] = useState('');
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

  const [datosReserva, setDatosReserva] = useState({
    descripcion: "",
    cantidadInvitados: "",
    notas: "",
  });

  const [error, setError] = useState(null);
  const [modalExpirada, setModalExpirada] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const enviandoRef = useRef(false);

  const {
    horarios,
    loading: loadingHorarios,
    refetch,
  } = useHorariosDisponibles(fechaSeleccionada, tipoEventoId, salonId);

  const { segundosRestantes, bloquear, liberar } = useBloqueoHorario();

  const tipoEvento = useMemo(
    () => tiposEvento.find((t) => t.id === tipoEventoId),
    [tiposEvento, tipoEventoId]
  );

  const salon = useMemo(
    () => salones.find((s) => String(s.salonId ?? s.id) === String(salonId)),
    [salones, salonId]
  );

  const pasoActualIndex = PASOS.findIndex((p) => p.id === paso);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleAvanzarDesdeTipo() {
    if (!nombreEvento.trim()) {
      setError("Ingresá el nombre del evento.");
      return;
    }
    if (!tipoEventoId) {
      setError("Seleccioná un tipo de evento para continuar.");
      return;
    }
    if (!salonId) {
      setError("Seleccioná un salón para continuar.");
      return;
    }
    setError(null);
    setPaso("horarios");
  }

  function handleSeleccionarHorario(horario) {
  setHorarioSeleccionado(horario);
  setError(null);
  setPaso("formulario");
}

  async function handleConfirmarEvento(datosFormulario) {
    if (
      enviandoRef.current ||
      !user ||
      !tipoEvento ||
      !salon ||
      !horarioSeleccionado ||
      !fechaSeleccionada
    ) {
      return;
    }

    enviandoRef.current = true;
    setEnviando(true);
    setError(null);

    try {

      const reservation = await createReservation(
        {
          userId:user.id,
          salonId:salonId,
          eventTypeId:Number(tipoEventoId),
          dateReserved:fechaSeleccionada
        });
        
      const payload=
      {
      eventOwner: user.id,
      reservationId: reservation.id, 
      estimedGuests: Number(cantInvitados),
      eventName: nombreEvento,
      description: "",
      eventStart: horarioSeleccionado.startTime,
      eventFinish: horarioSeleccionado.endTime,
      eventDate: fechaSeleccionada,
      }
      await createEvento(payload);

      successToast("Reserva creada con éxito. Puede configurar su evento. ")
    } catch (err) {
      if (err?.response?.status === 409) {
        errorToast("Ese horario ya no está disponible. Elegí otro.");

        setPaso("horarios");
        setHorarioSeleccionado(null);
        refetch();
      } else {
        setError("Ocurrió un error al crear el evento.");
      }
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  }

  async function handleAtras() {
    if (paso === "horarios") {
      setPaso("tipo");
    } else if (paso === "formulario") {
      setPaso("horarios");
      await liberar();
      setHorarioSeleccionado(null);
    }
  }

  function handleReintentarExpirada() {
    setModalExpirada(false);
    setPaso("horarios");
  }

  async function handleCancelarExpirada() {
    setModalExpirada(false);
    await liberar();
    setHorarioSeleccionado(null);
    setPaso("tipo");
  }

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Debes iniciar sesión para crear un evento.
      </div>
    );
  }

  if (!fechaSeleccionada) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-slate-600">No se seleccionó una fecha.</p>
          <button
            onClick={() => navigate("/disponibilidad")}
            className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-white"
          >
            Ir al calendario
          </button>
        </div>
      </div>
    );
  }

  const cargandoPaso1 = loadingTipos || loadingSalones;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <button
          onClick={() => navigate("/disponibilidad")}
          className="mb-4 text-indigo-600"
        >
          ← Volver a disponibilidad
        </button>

        <h1 className="mb-6 text-2xl font-semibold">Nuevo Evento</h1>

        <p className="mb-6 text-sm text-slate-500">
          Fecha seleccionada: <strong>{fechaSeleccionada}</strong>
        </p>

        <Stepper pasoActual={pasoActualIndex} />

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        {exito && (
          <div className="mb-4 rounded border border-green-300 bg-green-50 p-3 text-green-700">
            Evento creado exitosamente.
          </div>
        )}

        <div className="rounded-lg bg-white p-6 shadow">

          {/* ── PASO 1: Nombre + Tipo + Salón ────────────────────────────── */}
          {paso === "tipo" && (
            <div>
              <div className="mb-8">
                <h2 className="mb-1 text-lg font-medium text-slate-800">
                  ¿Cómo se llama tu evento?
                </h2>
                <p className="mb-3 text-sm text-slate-500">
                  Ingresá un nombre para identificar tu evento.
                </p>
                <input
                  type="text"
                  value={nombreEvento}
                  onChange={(e) => {
                    setNombreEvento(e.target.value);
                    setError(null);
                  }}
                  placeholder="Ej: Cumpleaños de Martina"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="mb-8">
                <h2 className="mb-1 text-lg font-medium text-slate-800">
                  ¿Cuantos invitados tendrá?
                </h2>
                <p className="mb-3 text-sm text-slate-500">
                  Ingresá el número de invitados.
                </p>
                <input
                  type="number"
                  value={cantInvitados}
                  onChange={(e) => {
                    setCantInvitados(e.target.value);
                    setError(null);
                  }}
                  placeholder="Ej: 150"
                  min={0}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="mb-8">
                <h2 className="mb-1 text-lg font-medium text-slate-800">
                  Tipo de evento
                </h2>
                <p className="mb-3 text-sm text-slate-500">
                  Seleccioná la categoría que mejor describe tu evento.
                </p>
                {loadingTipos && (
                  <p className="text-sm text-slate-500">Cargando tipos de evento…</p>
                )}
                {errorTipos && (
                  <p className="text-sm text-red-600">{errorTipos}</p>
                )}
                {!loadingTipos && !errorTipos && (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {tiposEvento.map((tipo) => {
                      const seleccionado = tipo.id === tipoEventoId;
                      return (
                        <li key={tipo.id}>
                          <button
                            onClick={() => {
                              setTipoEventoId(tipo.id);
                              setError(null);
                            }}
                            className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                              seleccionado
                                ? "border-indigo-600 bg-indigo-50"
                                : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                            }`}
                          >
                            <span className="block font-medium text-slate-800">
                              {getTipoNombre(tipo)}
                            </span>
                            <span className="mt-1 block text-sm text-slate-500">
                              ${getTipoPrecio(tipo).toLocaleString("es-AR")}
                            </span>
                            <span className="mt-0.5 block text-sm text-slate-500">
                              Duración: {getTipoDuracion(tipo) / 60} hs
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="mb-8">
                <h2 className="mb-1 text-lg font-medium text-slate-800">
                  Salón
                </h2>
                <p className="mb-3 text-sm text-slate-500">
                  Seleccioná el salón donde querés realizar tu evento.
                </p>
                {loadingSalones && (
                  <p className="text-sm text-slate-500">Cargando salones…</p>
                )}
                {errorSalones && (
                  <p className="text-sm text-red-600">{errorSalones}</p>
                )}
                {!loadingSalones && !errorSalones && (
                  <select
                    value={salonId ?? ""}
                    onChange={(e) => {
                      setSalonId(e.target.value || null);
                      setError(null);
                    }}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">-- Seleccioná un salón --</option>
                    {salones.map((s) => (
                      <option key={s.salonId ?? s.id} value={s.salonId ?? s.id}>
                        {s.salonName ?? s.name ?? `Salón ${s.salonId ?? s.id}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleAvanzarDesdeTipo}
                  disabled={cargandoPaso1}
                  className="rounded-md bg-indigo-600 px-5 py-2 text-white disabled:opacity-40"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 2: Horarios ─────────────────────────────────────────── */}
          {paso === "horarios" && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <button onClick={handleAtras} className="text-sm text-indigo-600">
                  ← Atrás
                </button>
                <div className="text-right text-sm text-slate-500 space-y-0.5">
                  <p>
                    Evento: <strong className="text-slate-700">{nombreEvento}</strong>
                  </p>
                  <p>
                    Tipo: <strong className="text-slate-700">{getTipoNombre(tipoEvento)}</strong>
                    {" · "}
                    Salón: <strong className="text-slate-700">{salon?.salonName}</strong>
                  </p>
                </div>
              </div>
              <SelectorHorarios
                horarios={horarios}
                loading={loadingHorarios}
                onSeleccionar={handleSeleccionarHorario}
              />
            </>
          )}

          {/* ── PASO 3: Formulario ───────────────────────────────────────── */}
            {paso === "formulario" && (
              <>
                <div className="mb-4">
                  <button onClick={handleAtras} className="text-sm text-indigo-600">
                    ← Atrás
                  </button>
                </div>

                <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <h3 className="mb-4 text-lg font-semibold text-slate-800">
                    Resumen de la reserva
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-slate-500">Evento</p>
                      <p className="font-medium text-slate-800">
                        {nombreEvento}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Fecha</p>
                      <p className="font-medium text-slate-800">
                        {fechaSeleccionada}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Tipo de evento</p>
                      <p className="font-medium text-slate-800">
                        {tipoEvento?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Salón</p>
                      <p className="font-medium text-slate-800">
                        {salon?.salonName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Horario</p>
                      <p className="font-medium text-slate-800">
                        {horarioSeleccionado?.startTime} -{" "}
                        {horarioSeleccionado?.endTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Duración</p>
                      <p className="font-medium text-slate-800">
                        {tipoEvento?.duration / 60} hs
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Invitados estimados</p>
                      <p className="font-medium text-slate-800">
                        {cantInvitados} 
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-slate-700">
                      Precio total
                    </span>
                    <span className="text-2xl font-bold text-indigo-600">
                      ${tipoEvento?.price?.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>
                 <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => handleConfirmarEvento(datosReserva)}
                    disabled={enviando}
                    className="rounded-md bg-indigo-600 px-6 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {enviando ? "Creando reserva..." : "Completar reserva"}
                  </button>
                </div>
              </>
            )}
        </div>
      </div>

      {/* ── Modal expiración ─────────────────────────────────────────────── */}
      {modalExpirada && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold">Tu reserva expiró</h3>
            <p className="mt-2 text-slate-600">
              El horario volvió a estar disponible.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={handleCancelarExpirada}
                className="rounded border px-4 py-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleReintentarExpirada}
                className="rounded bg-indigo-600 px-4 py-2 text-white"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
