import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TarjetasAdmin from "../../components/dashboard/TarjetasAdmin";
import GraficoReservas from "../../components/dashboard/GraficoReservas";
import Swal from "sweetalert2";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [opcionActiva, setOpcionActiva] = useState("gestion");

  // =========================================================================
  // ESTADOS PARA ALTO VOLUMEN (PESTAÑA GESTIÓN)
  // =========================================================================
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [filtroEstadoGestion, setFiltroEstadoGestion] = useState("Todos");

  // =========================================================================
  // ESTADOS DE FILTROS (PESTAÑA MÉTRICAS)
  // =========================================================================
  const [filtroAnio, setFiltroAnio] = useState("2026");
  const [filtroSalon, setFiltroSalon] = useState("Todos");
  const [filtroTipo, setFiltroTipo] = useState("Todos");

  useEffect(() => {
    setLoading(true);

    // Simulación del endpoint de la API aplicando la segmentación de filtros
    const fetchDatosFiltrados = () => {
      // 1. Valores comerciales base (Todos los salones, todos los eventos)
      let totalConfirmados = 24;
      let completados = 35;
      let eventoLider = "Casamientos";

      // 2. Modificación por Salón
      if (filtroSalon === "Salon-Principal") {
        totalConfirmados = 14;
        completados = 20;
      } else if (filtroSalon === "Salon-Terraza") {
        totalConfirmados = 8;
        completados = 11;
      } else if (filtroSalon === "Espacio-Jardin") {
        totalConfirmados = 2;
        completados = 4;
      }

      // Ajustes si miramos el año 2027 (Simulación de proyección futura)
      if (filtroAnio === "2027") {
        completados = 0;
        totalConfirmados = Math.floor(totalConfirmados * 1.3);
      }

      // 3. Inicialización de las curvas numéricas del Gráfico
      let seriesGrafico = {
        reservas: [2, 4, 5, 3, 6, 12, 4, 2, 7, 9, 15, 14],
        completados: [5, 4, 6, 2, 3, 1, 0, 0, 0, 0, 0, 0],
        cancelados: [1, 0, 2, 1, 0, 1, 0, 1, 0, 2, 1, 0],
      };

      // 4. El filtro de "Tipo de Evento" afecta a las Tarjetas Y al Gráfico
      if (filtroTipo !== "Todos") {
        if (filtroTipo === "Casamientos") {
          totalConfirmados = Math.round(totalConfirmados * 0.5);
          completados = Math.round(completados * 0.45);
          seriesGrafico = {
            reservas: [1, 2, 2, 1, 3, 5, 2, 1, 4, 4, 8, 7],
            completados: [2, 1, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0],
            cancelados: [0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0],
          };
        } else if (filtroTipo === "15 Años") {
          totalConfirmados = Math.round(totalConfirmados * 0.35);
          completados = Math.round(completados * 0.35);
          seriesGrafico = {
            reservas: [1, 1, 2, 1, 2, 4, 1, 1, 2, 3, 5, 5],
            completados: [2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0],
            cancelados: [1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0],
          };
        } else if (filtroTipo === "Corporativos") {
          totalConfirmados = Math.round(totalConfirmados * 0.15);
          completados = Math.round(completados * 0.2);
          seriesGrafico = {
            reservas: [0, 1, 1, 1, 1, 3, 1, 0, 1, 2, 2, 2],
            completados: [1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            cancelados: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          };
        }
      }

      // Si además del tipo de evento se filtró un salón específico, adaptamos las barras proporcionalmente
      if (filtroSalon !== "Todos" && filtroTipo !== "Todos") {
        const factor = filtroSalon === "Salon-Principal" ? 0.6 : 0.4;
        seriesGrafico.reservas = seriesGrafico.reservas.map((v) =>
          Math.round(v * factor),
        );
        seriesGrafico.completados = seriesGrafico.completados.map((v) =>
          Math.round(v * factor),
        );
        seriesGrafico.cancelados = seriesGrafico.cancelados.map((v) =>
          Math.round(v * factor),
        );
      }

      // =========================================================================
      // 5. SOLUCIÓN: CÁLCULO DINÁMICO REAL DEL MES DE MAYOR DEMANDA
      // =========================================================================
      const nombresMesesCompletos = [
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

      // Escaneamos el valor más alto dentro del vector de reservas activas actuales
      const maxReservasMes = Math.max(...seriesGrafico.reservas);

      // Buscamos el índice posicional (0 al 11) de esa métrica máxima
      const indiceMesPico = seriesGrafico.reservas.indexOf(maxReservasMes);

      // Si el valor máximo es cero significa que no hay contratos vigentes en los filtros seleccionados
      const mesPicoCalculado =
        maxReservasMes > 0
          ? nombresMesesCompletos[indiceMesPico]
          : "Sin reservas";

      // =========================================================================
      // 6. CONSTRUCCIÓN DEL OBJETO DE DATOS FINAL
      // =========================================================================
      const mockData = {
        totalConfirmados,
        completados,
        mesPico: mesPicoCalculado, // Usa el resultado del análisis automatizado de arriba
        eventoLider,
        reservasGestion: [
          {
            id: 201,
            cliente: "Familia Benítez",
            info: "Fiesta de 15 Años • Salón Principal",
            fechaBadge: "SÁB 13 JUN",
            invitados: 120,
            estado: "Señado",
          },
          {
            id: 202,
            cliente: "Sofía & Marcos",
            info: "Boda • Salón Principal",
            fechaBadge: "SÁB 20 JUN",
            invitados: 200,
            estado: "Señado",
          },
          {
            id: 203,
            cliente: "Tech Solutions S.A.",
            info: "Cena Corporativa • Salón Terraza",
            fechaBadge: "VIE 26 JUN",
            invitados: 80,
            estado: "Señado",
          },
          {
            id: 204,
            cliente: "Carlos Gómez",
            info: "Cumpleaños • Espacio Jardín",
            fechaBadge: "DOM 28 JUN",
            invitados: 50,
            estado: "Pendiente",
          },
          {
            id: 205,
            cliente: "Lucía Fernández",
            info: "Fiesta de 15 Años • Salón Principal",
            fechaBadge: "SÁB 04 JUL",
            invitados: 150,
            estado: "Señado",
          },
        ],
        grafico: {
          labels: [
            "Ene",
            "Feb",
            "Mar",
            "Abr",
            "May",
            "Jun",
            "Jul",
            "Ago",
            "Sep",
            "Oct",
            "Nov",
            "Dic",
          ],
          series: seriesGrafico,
        },
      };

      setData(mockData);
      setLoading(false);
    };

    fetchDatosFiltrados();
  }, [filtroAnio, filtroSalon, filtroTipo]);

  const handleCancelarReserva = (id, cliente) => {
    Swal.fire({
      title: `¿Cancelar reserva de ${cliente}?`,
      text: "Esta acción liberará la fecha en el calendario inmediatamente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cancelar contrato",
      cancelButtonText: "Atrás",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          "Cancelado",
          "El evento ha sido dado de baja de la agenda.",
          "success",
        );
        setData((prev) => ({
          ...prev,
          reservasGestion: prev.reservasGestion.filter((r) => r.id !== id),
        }));
      }
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Encabezado Principal */}
      <div className="mb-6 text-left">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestión integral Multi-Salón • Sistema Administrativo.
        </p>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div className="flex border-b border-gray-200 mb-6 gap-2">
        <button
          onClick={() => setOpcionActiva("gestion")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            opcionActiva === "gestion"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          📋 Gestión de Reservas
        </button>

        <button
          onClick={() => setOpcionActiva("metricas")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            opcionActiva === "metricas"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          📊 Ver Métricas y Reportes
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: GESTIÓN DE RESERVAS                                            */}
      {/* ========================================================================= */}
      {opcionActiva === "gestion" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col text-left sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h4 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                  🚀 Agenda Próxima Inmediata
                </h4>
                <p className="text-xs text-gray-400">
                  Cronograma integrado con acciones directas. Modificá o cancelá
                  sin listas duplicadas.
                </p>
              </div>
              <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full self-start sm:self-center">
                {data?.reservasGestion ? data.reservasGestion.length : 0}{" "}
                Eventos cargados
              </span>
            </div>

            {/* BARRA DE HERRAMIENTAS */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col sm:flex-row gap-3 items-center mb-6">
              <div className="relative w-full sm:flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Buscar por nombre de persona (solicitante) o salón..."
                  value={busquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-700 pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-left"
                />
              </div>

              <div className="w-full sm:w-44">
                <select
                  value={filtroEstadoGestion}
                  onChange={(e) => setFiltroEstadoGestion(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-left"
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="Señado">Señados</option>
                  <option value="Pendiente">Pendientes</option>
                </select>
              </div>
            </div>

            {/* GRILLA CON SCROLL */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[520px] overflow-y-auto pr-1">
              {data?.reservasGestion
                .filter((reserva) => {
                  const cumpleNombre =
                    reserva.cliente
                      .toLowerCase()
                      .includes(busquedaCliente.toLowerCase()) ||
                    reserva.info
                      .toLowerCase()
                      .includes(busquedaCliente.toLowerCase());
                  const cumpleEstado =
                    filtroEstadoGestion === "Todos" ||
                    reserva.estado === filtroEstadoGestion;
                  return cumpleNombre && cumpleEstado;
                })
                .map((reserva) => (
                  <div
                    key={reserva.id}
                    className="p-4 bg-gradient-to-br from-indigo-50/20 to-gray-50/50 border border-gray-100 rounded-xl relative overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-gray-200 transition-all min-h-[175px]"
                  >
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white font-bold text-[10px] px-3 py-1 rounded-bl-xl shadow-sm tracking-wide">
                      {reserva.fechaBadge}
                    </div>

                    <div className="text-left">
                      <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                        {reserva.info.split("•")[1] || "Salón"}
                      </span>
                      <h5 className="font-bold text-gray-800 text-sm mt-0.5">
                        {reserva.info.split("•")[0]}
                      </h5>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Cliente: {reserva.cliente}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2 w-full">
                      <button
                        onClick={() =>
                          navigate(`/reservas/${reserva.id}/editar`)
                        }
                        className="px-2.5 py-1.5 bg-white border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-200 rounded-lg text-[11px] font-semibold shadow-sm flex items-center gap-1"
                      >
                        ✏️ Re-programar
                      </button>
                      <button
                        onClick={() =>
                          handleCancelarReserva(reserva.id, reserva.cliente)
                        }
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[11px] font-bold"
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: MÉTRICAS Y REPORTES                                            */}
      {/* ========================================================================= */}
      {opcionActiva === "metricas" && (
        <div className="space-y-6 animate-fadeIn">
          {/* BARRA DE FILTROS TRIPLE */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              {/* Filtro 1: Año */}
              <div className="flex flex-col gap-1 w-full sm:w-36 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Año
                </label>
                <select
                  value={filtroAnio}
                  onChange={(e) => setFiltroAnio(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full"
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>

              {/* Filtro 2: Salón */}
              <div className="flex flex-col gap-1 w-full sm:w-48 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Salón / Espacio
                </label>
                <select
                  value={filtroSalon}
                  onChange={(e) => setFiltroSalon(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full"
                >
                  <option value="Todos">Todos los Salones</option>
                  <option value="Salon-Principal">Salón Principal</option>
                  <option value="Salon-Terraza">Salón Terraza</option>
                  <option value="Espacio-Jardin">Espacio Jardín</option>
                </select>
              </div>

              {/* Filtro 3: Tipo de Evento */}
              <div className="flex flex-col gap-1 w-full sm:w-48 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Tipo de Evento
                </label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="bg-indigo-50/60 border border-indigo-200 text-gray-700 py-2 px-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full font-medium"
                >
                  <option value="Todos">Todos los formatos</option>
                  <option value="Casamientos">Casamientos / Bodas</option>
                  <option value="15 Años">Cumpleaños de 15</option>
                  <option value="Corporativos">Eventos Empresariales</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-80 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
              <p className="text-gray-400 font-medium text-sm animate-pulse">
                Procesando indicadores...
              </p>
            </div>
          ) : (
            <>
              {/* TARJETAS DE INDICADORES COMERCIALES */}
              <TarjetasAdmin metricas={data} />

              {/* GRÁFICO Y ANÁLISIS DE RENDIMIENTO */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <GraficoReservas datosGrafico={data?.grafico} />
                </div>

                {/* Resumen Lateral Informativo */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-1 text-left">
                      Análisis de Rendimiento
                    </h4>
                    <p className="text-xs text-gray-400 mb-4 text-left">
                      Resultados segmentados según los filtros de la barra
                      superior.
                    </p>

                    <div className="space-y-4">
                      <div className="pt-1 text-left">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block mb-2">
                          Métricas del Formato
                        </span>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="text-xs font-medium text-gray-500">
                            Segmento Evaluado:
                          </span>
                          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                            {filtroTipo === "Todos"
                              ? "Global Comercial"
                              : filtroTipo}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="text-xs font-medium text-gray-500">
                            Espacio Seleccionado:
                          </span>
                          <span className="text-sm font-bold text-gray-700">
                            {filtroSalon === "Todos"
                              ? "Todos los Salones"
                              : filtroSalon.replace("-", " ")}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-xs font-medium text-gray-500">
                            Mes de Mayor Demanda:
                          </span>
                          <span className="text-sm font-bold text-indigo-600">
                            {data?.mesPico}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mt-5 text-left">
                    <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                      💡{" "}
                      <span className="font-bold text-gray-700">
                        Control unificado:
                      </span>{" "}
                      Tanto las tres tarjetas de arriba como el desglose mensual
                      del gráfico reflejan la información exacta del año, el
                      espacio y el tipo de fiesta que seleccionaste.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
