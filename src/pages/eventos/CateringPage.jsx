import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerSugerenciasCatering } from '../../services/proveedoresService';

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
    loadSugerencias(nivel);
  }, [nivel]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">

        {id && (
          <button
            onClick={() => navigate(`/eventos/${id}`)}
            className="mb-4 text-sm text-indigo-600 hover:text-indigo-800"
          >
            ← Volver al Evento
          </button>
        )}

        <h1 className="text-2xl font-bold mb-4">
          Sugerencias de Catering
        </h1>

        <div className="flex gap-2 mb-6">
          {NIVELES.map((opcion) => (
            <button
              key={opcion.label}
              onClick={() => setNivel(opcion.value)}
              className={`px-4 py-2 rounded ${
                nivel === opcion.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border'
              }`}
            >
              {opcion.label}
            </button>
          ))}
        </div>

        {loading && <p>Cargando...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid md:grid-cols-3 gap-4">
          {opciones.map((o) => (
            <div key={o.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-bold">{o.nivel}</h3>
              <p>${o.precio}</p>
              <p>{o.descripcion}</p>
              <p className="text-sm text-gray-500">
                {o.proveedorSugerido}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}