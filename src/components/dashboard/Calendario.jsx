import { useEffect, useState } from "react";
import { getEventos } from "../../services/eventosService";
import { getSalons } from "../../services/salonService";
import { getAllTypes } from "../../services/eventTypeService";
import { getUserById } from "../../services/authService";

export default function Calendario() {
  const hoy = new Date();

  // Estados del calendario y vistas
  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [anioActual, setAnioActual] = useState(hoy.getFullYear());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    hoy.toISOString().split("T")[0],
  );
  const [vistaEventos, setVistaEventos] = useState(false);

  // Estados de datos indexados
  const [eventos, setEventos] = useState([]);
  const [salonesById, setSalonesById] = useState({});
  const [tiposById, setTiposById] = useState({});
  const [usuariosById, setUsuariosById] = useState({});
  const [cargando, setCargando] = useState(false);
  const [mapaEventosMes, setMapaEventosMes] = useState({});

  // 1. Cargar Salones y Tipos de Eventos al montar el componente
  useEffect(() => {
    async function cargarDatosMaestros() {
      try {
        const listaSalones = await getSalons();
        const dicSalones = listaSalones.reduce((acc, salon) => {
          acc[salon.salonId] = salon;
          return acc;
        }, {});
        setSalonesById(dicSalones);

        const listaTipos = await getAllTypes();
        const dicTipos = listaTipos.reduce((acc, tipo) => {
          acc[tipo.id] = tipo;
          return acc;
        }, {});
        setTiposById(dicTipos);
      } catch (error) {
        console.error("Error al cargar datos maestros:", error);
      }
    }
    cargarDatosMaestros();
  }, []);

  // 2. Traer los eventos del mes para calcular los puntos verdes válidos (Estatus 1 o 2)
  useEffect(() => {
    const controller = new AbortController();

    async function mapearEventosDelMes() {
      try {
        const mesFormateado = String(mesActual + 1).padStart(2, "0");
        const filtros = {
          Anio: anioActual,
          Mes: mesFormateado,
        };

        const eventosMes = await getEventos(filtros, controller.signal);

        const mapa = {};
        eventosMes.forEach((ev) => {
          if (ev.eventDate) {
            const fechaStr = ev.eventDate.split("T")[0];
            if (ev.eventStatusId === 1 || ev.eventStatusId === 2) {
              mapa[fechaStr] = true;
            }
          }
        });
        setMapaEventosMes(mapa);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error al mapear los eventos del mes:", error);
        }
      }
    }

    mapearEventosDelMes();
    return () => controller.abort();
  }, [mesActual, anioActual]);

  // 3. Traer eventos en detalle para el día específico y consultar sus dueños (eventOwner)
  useEffect(() => {
    const controller = new AbortController();

    async function cargarEventosDia() {
      setCargando(true);
      try {
        const filtros = { EventDate: fechaSeleccionada };
        const listaEventos = await getEventos(filtros, controller.signal);
        setEventos(listaEventos);

        // Identificar qué dueños de eventos no tenemos en caché todavía
        const duenosDesconocidos = listaEventos
          .map((ev) => ev.eventOwner)
          .filter((id) => id && !usuariosById[id]);

        // CORREGIDO: Se eliminó el espacio en blanco inválido del nombre de la variable
        const idsUnicos = [...new Set(duenosDesconocidos)];

        if (idsUnicos.length > 0) {
          const nuevosUsuarios = {};

          await Promise.all(
            idsUnicos.map(async (id) => {
              try {
                const datosUsuario = await getUserById(id);
                nuevosUsuarios[id] = datosUsuario;
              } catch (err) {
                console.error(`Error al cargar el usuario con ID ${id}:`, err);
                nuevosUsuarios[id] = {
                  name: "Organizador",
                  lastName: "No Disponible",
                };
              }
            }),
          );

          setUsuariosById((prev) => ({
            ...prev,
            ...nuevosUsuarios,
          }));
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error al cargar los eventos del día:", error);
        }
      } finally {
        setCargando(false);
      }
    }

    cargarEventosDia();
    return () => controller.abort();
  }, [fechaSeleccionada]);

  // --- LÓGICA PARA GENERAR LA CUADRÍCULA ---
  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const primerDiaIndex = new Date(anioActual, mesActual, 1).getDay();
  const totalDiasMes = new Date(anioActual, mesActual + 1, 0).getDate();

  const matrizDias = [];
  for (let i = 0; i < primerDiaIndex; i++) matrizDias.push(null);
  for (let dia = 1; dia <= totalDiasMes; dia++) matrizDias.push(dia);

  const manejarMesAnterior = () => {
    if (mesActual === 0) {
      setMesActual(11);
      setAnioActual((prev) => prev - 1);
    } else {
      setMesActual((prev) => prev - 1);
    }
  };

  const manejarMesSiguiente = () => {
    if (mesActual === 11) {
      setMesActual(0);
      setAnioActual((prev) => prev + 1);
    } else {
      setMesActual((prev) => prev + 1);
    }
  };

  const seleccionarDia = (dia) => {
    if (!dia) return;
    const mesFormateado = String(mesActual + 1).padStart(2, "0");
    const diaFormateado = String(dia).padStart(2, "0");
    setFechaSeleccionada(`${anioActual}-${mesFormateado}-${diaFormateado}`);
    setVistaEventos(true);
  };

  const formatearHora = (horaStr) => {
    if (!horaStr) return "--:--";
    return horaStr.split(":").slice(0, 2).join(":");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#0C447C]">
          Calendario de Eventos
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {vistaEventos
            ? "Visualizando los eventos agendados para la fecha seleccionada."
            : "Navega por los meses de la cuadrícula y haz clic en cualquier día para inspeccionar sus eventos."}
        </p>
      </div>

      <hr className="border-slate-200" />

      {!vistaEventos ? (
        /* --- VISTA A: CALENDARIO COMPLETO --- */
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">
              {nombresMeses[mesActual]}{" "}
              <span className="text-[#0C447C] font-semibold">{anioActual}</span>
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={manejarMesAnterior}
                className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
              >
                ←
              </button>
              <button
                onClick={manejarMesSiguiente}
                className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-2">
            {diasSemana.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {matrizDias.map((dia, index) => {
              const mesFormateado = String(mesActual + 1).padStart(2, "0");
              const diaFormateado = String(dia).padStart(2, "0");
              const stringCasillero = `${anioActual}-${mesFormateado}-${diaFormateado}`;

              const tieneEventosValidos =
                dia && mapaEventosMes[stringCasillero];

              return (
                <button
                  key={index}
                  disabled={!dia}
                  onClick={() => seleccionarDia(dia)}
                  className={`h-14 rounded-lg flex flex-col justify-between items-center p-2 text-sm font-medium transition relative
                    ${!dia ? "bg-transparent cursor-default" : "bg-white text-slate-700 border border-slate-100 hover:border-[#0C447C] hover:bg-slate-50"}
                  `}
                >
                  <span>{dia}</span>

                  {tieneEventosValidos && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* --- VISTA B: LISTA DE EVENTOS EN DETALLE --- */
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 max-w-3xl mx-auto flex flex-col space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                Día Inspeccionado
              </span>
              <h3 className="text-xl font-bold text-slate-800 mt-0.5">
                {fechaSeleccionada}
              </h3>
            </div>
            <button
              onClick={() => setVistaEventos(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              ← Volver al calendario
            </button>
          </div>

          {cargando ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#0C447C] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-slate-400">
                Cargando eventos de la fecha...
              </p>
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-500 font-medium">
                No hay ningún evento registrado en esta fecha.
              </p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[480px] pr-1">
              {eventos.map((evento) => {
                const datosSalon = salonesById[evento.salonId] || {
                  salonName: "Salón No Asignado",
                  address: "Dirección No Disponible",
                };

                const datosTipo = tiposById[evento.eventTypeId] || {
                  nombre: "Desconocido",
                };

                const datosOrganizador = usuariosById[evento.eventOwner] || {
                  name: "Organizador",
                  lastName: "Cargando...",
                  email: "",
                  phone: "",
                };

                return (
                  <div
                    key={evento.id || evento.eventId}
                    className="p-5 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-xs"
                  >
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg leading-snug">
                          {evento.eventName || evento.nombre || "Sin Nombre"}
                        </h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                          <p className="flex items-center text-[#0C447C] font-medium">
                            Horario: {formatearHora(evento.eventStart)} -{" "}
                            {formatearHora(evento.eventFinish)}
                          </p>
                          <p className="text-slate-400">
                            {evento.estimedGuests || 0} invitados
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 space-y-0.5 border-t border-slate-200/50 pt-2 mt-1">
                        <p className="font-medium text-slate-700">
                          Organizador: {datosOrganizador.name}{" "}
                          {datosOrganizador.lastName}
                        </p>
                        {datosOrganizador.email && (
                          <p className="text-slate-400 text-[11px]">
                            Contacto: {datosOrganizador.email}{" "}
                            {datosOrganizador.phone &&
                              `| Tel: ${datosOrganizador.phone}`}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between sm:justify-end items-center gap-5 border-t border-slate-200/60 pt-3 sm:pt-0 sm:border-t-0 flex-1 sm:flex-initial">
                      <div className="text-xs space-y-0.5 text-left sm:text-right">
                        <p className="font-bold text-slate-700">
                          {datosSalon.salonName}
                        </p>
                        <p className="text-slate-400 text-[11px] max-w-[200px] truncate">
                          {datosSalon.address}
                        </p>
                      </div>

                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#0C447C]/10 text-[#0C447C] whitespace-nowrap uppercase tracking-wider">
                        {datosTipo.nombre || datosTipo.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
