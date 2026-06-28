import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerSugerenciasCatering, obtenerSeleccionCatering, guardarSeleccionCatering } from '../../services/proveedoresService';
import { successToast, errorToast } from '../../globals/toast';

const NIVELES = [
  { value: null, label: 'Todas' },
  { value: 'bajo', label: 'Bajo' },
  { value: 'medio', label: 'Medio' },
  { value: 'alto', label: 'Alto' },
];

export default function CateringPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [opciones, setOpciones] = useState([]);
  const [nivel, setNivel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seleccionadoId, setSeleccionadoId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const loadSeleccion = async () => {
    if (!id) return;
    try {
      const { data } = await obtenerSeleccionCatering(id);
      if (data) {
        setSeleccionadoId(data.proveedorId);
      }
    } catch (err) {
      console.error("Error al obtener seleccion de catering:", err);
    }
  };

  const loadSugerencias = async (nivelSeleccionado) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await obtenerSugerenciasCatering(nivelSeleccionado);
      setOpciones(Array.isArray(data) ? data : data?.items ?? []);
    } catch (err) {
      console.error(err);
      setError('Error al cargar sugerencias de catering');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeleccion();
    loadSugerencias(nivel);
  }, [id, nivel]);

  const handleSeleccionar = async (proveedorId) => {
    if (!id) return;
    try {
      setSavingId(proveedorId);
      await guardarSeleccionCatering(id, proveedorId);
      setSeleccionadoId(proveedorId);
      successToast("Catering Seleccionado", "El catering ha sido asignado al evento con éxito.");
      setTimeout(() => {
        navigate(`/eventos/${id}`);
      }, 1500);
    } catch (err) {
      console.error("Error al guardar seleccion de catering:", err);
      const msg = err.response?.data?.message ?? "No se pudo guardar la seleccion de catering.";
      errorToast("Error al seleccionar", msg);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">

        {id && (
          <button
            onClick={() => navigate(`/eventos/${id}`)}
            className="mb-4 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium transition"
          >
            ← Volver al Evento
          </button>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Sugerencias de Catering
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Elegí la opción gastronómica que mejor se adapte a tu presupuesto y necesidades.
            </p>
          </div>

          <div className="flex gap-2">
            {NIVELES.map((opcion) => (
              <button
                key={opcion.label}
                onClick={() => setNivel(opcion.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  nivel === opcion.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opcion.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-500 text-sm">Cargando propuestas...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center mb-6">
            {error}
          </div>
        )}

        {!loading && opciones.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400">
            No se encontraron propuestas de catering para este nivel.
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {opciones.map((o) => {
            const esSeleccionado = o.proveedorId === seleccionadoId;
            const estaGuardando = o.proveedorId === savingId;

            return (
              <div
                key={o.proveedorId}
                className={`bg-white p-6 rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                  esSeleccionado ? 'border-indigo-600 ring-2 ring-indigo-600 ring-opacity-50' : 'border-slate-100'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      o.nivel === "alto"
                        ? "bg-amber-100 text-amber-800"
                        : o.nivel === "medio"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-800"
                    }`}>
                      Nivel {o.nivel}
                    </span>
                    <span className="text-xl font-bold text-indigo-600">
                      ${o.precioPorPersona?.toLocaleString('es-AR')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {o.nombreProveedor}
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {o.descripcionMenu}
                  </p>
                </div>

                <button
                  onClick={() => handleSeleccionar(o.proveedorId)}
                  disabled={esSeleccionado || savingId !== null}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 ${
                    esSeleccionado
                      ? 'bg-green-100 text-green-800 cursor-default'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 disabled:opacity-50'
                  }`}
                >
                  {estaGuardando ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Guardando...
                    </>
                  ) : esSeleccionado ? (
                    '✓ Seleccionado'
                  ) : (
                    'Seleccionar Propuesta'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}