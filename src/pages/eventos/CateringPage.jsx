import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCateringOptions, saveCateringSelection } from '../../services/cateringService';

export default function CateringPage() {
  const { id } = useParams(); // eventoId
  const navigate = useNavigate();

  const [opciones, setOpciones] = useState([]);
  const [seleccionGuardada, setSeleccionGuardada] = useState(null);
  const [seleccionActual, setSeleccionActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCatering = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCateringOptions(id);
      setOpciones(data.opciones);
      setSeleccionGuardada(data.seleccionActual);
      setSeleccionActual(data.seleccionActual);
    } catch (err) {
      setError(err.message || 'Error al cargar opciones de catering');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatering();
  }, [id]);

  const handleSelect = (opcionId) => {
    setSeleccionActual(opcionId);
  };

  const handleConfirmar = async () => {
    if (!seleccionActual) return;
    
    setSaving(true);
    try {
      const result = await saveCateringSelection(id, seleccionActual);
      setSeleccionGuardada(result.seleccionActual);
      showToast('Selección guardada correctamente');
    } catch (err) {
      showToast(err.message || 'Error al guardar selección', 'error');
    } finally {
      setSaving(false);
    }
  };

  const hayCambios = seleccionActual !== seleccionGuardada;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate(`/eventos/${id}`)}
          className="mb-4 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          ← Volver al Evento
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Sugerencias de Catering</h1>
          <p className="text-sm text-slate-500">Elegí la opción que mejor se adapte al presupuesto del evento.</p>
        </div>

        {toast && (
          <div className={`fixed bottom-4 right-4 z-50 rounded-md px-4 py-3 text-sm text-white shadow-lg transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.message}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-slate-500">Cargando opciones...</div>
        ) : error ? (
          <div className="py-8 text-center bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="mb-4 text-red-500">{error}</div>
            <button onClick={loadCatering} className="text-indigo-600 hover:underline">Reintentar</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {opciones.map((opcion) => {
                const isSelected = seleccionActual === opcion.id;
                const isSaved = seleccionGuardada === opcion.id;

                return (
                  <div 
                    key={opcion.id}
                    onClick={() => handleSelect(opcion.id)}
                    className={`relative cursor-pointer rounded-xl p-6 transition-all duration-200 flex flex-col h-full
                      ${isSelected 
                        ? 'bg-white ring-2 ring-indigo-500 shadow-md transform scale-[1.02]' 
                        : 'bg-white border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md'
                      }
                    `}
                  >
                    {isSaved && (
                      <div className="absolute -top-3 -right-3 rounded-full bg-green-500 text-white p-1 shadow-sm" title="Opción Guardada">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-slate-800 mb-1">{opcion.nivel}</h3>
                      <div className="text-2xl font-black text-indigo-600">
                        ${opcion.precio.toLocaleString('es-AR')}
                        <span className="text-sm font-normal text-slate-500"> / persona</span>
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <p className="text-sm text-slate-600 mb-4">{opcion.descripcion}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100 mt-auto">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Proveedor sugerido</p>
                      <p className="text-sm font-medium text-slate-800">{opcion.proveedorSugerido}</p>
                    </div>

                    {isSelected && (
                      <div className="absolute inset-x-0 -bottom-3 flex justify-center">
                        <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          Seleccionado
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleConfirmar}
                disabled={!hayCambios || saving}
                className={`rounded-md px-6 py-3 font-medium transition-colors shadow-sm
                  ${hayCambios 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }
                `}
              >
                {saving ? 'Guardando...' : 'Confirmar Selección'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
