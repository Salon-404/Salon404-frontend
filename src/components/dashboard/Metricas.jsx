import { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboardService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAllTypes } from "../../services/eventTypeService";
import { getSalons } from "../../services/salonService";

export default function Metricas() {
  // Datos principales de la API
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true); // Empezamos en true porque ahora sí carga de entrada
  const [error, setError] = useState(null);

  // LISTAS PARA LOS MENÚS DESPLEGABLES
  const [salones, setSalones] = useState([]);
  const [tiposEvento, setTiposEvento] = useState([]);

  // Estados de los filtros seleccionados (Año actual por defecto, los otros vacíos/globales)
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [salonId, setSalonId] = useState("");
  const [tipoEventoId, setTipoEventoId] = useState("");

  // 1. CARGA INICIAL DE LOS MENÚS DESPLEGABLES
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const listaTipos = await getAllTypes();
        const listaSalones = await getSalons();

        setSalones(listaSalones);
        setTiposEvento(listaTipos);
      } catch (err) {
        console.error("Error al cargar los catálogos del menú:", err);
      }
    };

    cargarCatalogos();
  }, []);

  // 2. PETICIÓN DE MÉTRICAS (Ahora se ejecuta siempre, aunque vengan vacíos)
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Si tipoEventoId está vacío, pasamos string vacío o null según lo espere tu API C#
        const paramTipo = tipoEventoId ? Number(tipoEventoId) : "";

        const responseData = await dashboardService.getMetrics(
          anio,
          salonId, // Va como "" si no se selecciona ninguno
          paramTipo,
        );
        setData(responseData);

        if (responseData?.grafico) {
          const { labels, series } = responseData.grafico;

          const nombresCompletosMeses = {
            Ene: "Enero",
            Feb: "Febrero",
            Mar: "Marzo",
            Abr: "Abril",
            May: "Mayo",
            Jun: "Junio",
            Jul: "Julio",
            Ago: "Agosto",
            Sep: "Septiembre",
            Oct: "Octubre",
            Nov: "Noviembre",
            Dic: "Diciembre",
          };

          const formattedData = labels.map((mes, index) => ({
            name: mes,
            fullName: nombresCompletosMeses[mes] || mes,
            Reservas: series.reservas?.[index] || 0,
            Completados: series.completados?.[index] || 0,
            Cancelados: series.cancelados?.[index] || 0,
          }));

          setChartData(formattedData);
        }
      } catch (err) {
        console.error("Error al cargar las métricas:", err);
        setError(
          "No se pudieron obtener los datos para los filtros seleccionados.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [anio, salonId, tipoEventoId]); // Reacciona a cualquier cambio, incluyendo volver a "Todos"

  return (
    <div className="space-y-6">
      {/* Título de la sección */}
      <div>
        <h2 className="text-2xl font-semibold text-[#0C447C]">
          Métricas generales
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Aquí podrás visualizar las estadísticas y el rendimiento general.
        </p>
      </div>

      {/* PANEL DE FILTROS */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filtro Año */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Año
          </label>
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-[#185FA5] bg-white text-slate-700"
          />
        </div>

        {/* Desplegable Salón */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Salón
          </label>
          <select
            value={salonId}
            onChange={(e) => setSalonId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-[#185FA5] bg-white text-slate-700 font-medium"
          >
            <option value="">Todos los salones</option>

            {salones.map((s) => (
              <option key={s.salonId} value={s.salonId}>
                {s.salonName}
              </option>
            ))}
          </select>
        </div>

        {/* Desplegable Tipo de Evento */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Tipo Evento
          </label>
          <select
            value={tipoEventoId}
            onChange={(e) => setTipoEventoId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-[#185FA5] bg-white text-slate-700 font-medium"
          >
            <option value="">Todos los tipos de eventos</option>

            {tiposEvento.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ZONA DE CONTENIDO DINÁMICO */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-[#0C447C] font-medium">
          <span className="animate-pulse">Cargando métricas...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-32 text-red-500 font-medium border border-red-100 bg-red-50 rounded-2xl p-4">
          {error}
        </div>
      ) : data ? (
        <>
          {/* TARJETAS DE INDICADORES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">Confirmados</p>
              <h3 className="text-3xl font-bold text-[#0C447C] mt-2">
                {data.indicadores?.confirmados ?? 0}
              </h3>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">Completados</p>
              <h3 className="text-3xl font-bold text-[#0C447C] mt-2">
                {data.indicadores?.completados ?? 0}
              </h3>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">Totales</p>
              <h3 className="text-3xl font-bold text-[#0C447C] mt-2">
                {data.indicadores?.totalPeriodo ?? 0}
              </h3>
            </div>
          </div>

          {/* SECCIÓN DEL GRÁFICO */}
          <div className="border border-slate-100 rounded-3xl p-6 bg-white shadow-sm">
            <h4 className="text-md font-semibold text-[#0C447C] mb-6">
              Histórico Anual ({anio})
            </h4>

            <div className="w-full h-80">
              <ResponsiveContainer width="100%" h="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F1F5F9"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748B", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748B", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    labelFormatter={(value) => {
                      const nombresCompletosMeses = {
                        Ene: "Enero",
                        Feb: "Febrero",
                        Mar: "Marzo",
                        Abr: "Abril",
                        May: "Mayo",
                        Jun: "Junio",
                        Jul: "Julio",
                        Ago: "Agosto",
                        Sep: "Septiembre",
                        Oct: "Octubre",
                        Nov: "Noviembre",
                        Dic: "Diciembre",
                      };
                      return nombresCompletosMeses[value] || value;
                    }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "13px" }}
                  />

                  <Bar
                    dataKey="Reservas"
                    fill="#185FA5"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Completados"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Cancelados"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-slate-400 py-10">
          No hay información disponible.
        </div>
      )}
    </div>
  );
}
