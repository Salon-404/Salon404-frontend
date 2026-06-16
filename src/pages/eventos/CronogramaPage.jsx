import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCronograma, createCronogramaItem, updateCronogramaItem, deleteCronogramaItem } from '../../services/cronogramaService';
import CronogramaFormModal from '../../components/eventos/CronogramaFormModal';
import { useAuth } from '../../context/AuthContext';
import { decodeToken } from '../../globals/decodeToken';
import { TOKEN_KEY, ROLES } from '../../constants/auth';

export default function CronogramaPage() {
  const { id } = useParams(); // eventoId
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCronograma = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCronograma(id);
      setItems(data);
    } catch (err) {
      setError(err.message || 'Error al cargar el cronograma');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCronograma();
  }, [id]);

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('¿Eliminar este ítem del cronograma?')) return;
    try {
      await deleteCronogramaItem(id, itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
      showToast('Ítem eliminado');
    } catch (err) {
      showToast(err.message || 'Error al eliminar', 'error');
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingItem) {
        const updated = await updateCronogramaItem(id, editingItem.id, data);
        setItems(prev => {
          const newArr = prev.map(i => i.id === updated.id ? updated : i);
          return newArr.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
        });
        showToast('Ítem actualizado');
      } else {
        const newItem = await createCronogramaItem(id, data);
        setItems(prev => {
          const newArr = [...prev, newItem];
          return newArr.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
        });
        showToast('Ítem agregado');
      }
    } catch (err) {
      showToast(err.message || 'Error al guardar', 'error');
      throw err;
    }
  };

  // Determinar si hay un ítem "en curso" (muy simple: basado en la hora actual si es el mismo día, 
  // pero como es mock, solo visualizamos la estructura. Podemos mockear el "en curso" basado en la hora local).
  const nowTime = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(`/eventos/${id}`)}
          className="mb-4 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          ← Volver al Evento
        </button>

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Cronograma del Evento</h1>
            <p className="text-sm text-slate-500">Horarios y actividades planificadas.</p>
          </div>
          {isAdmin && (
            <button
              onClick={handleOpenNew}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              + Agregar Ítem
            </button>
          )}
        </div>

        {toast && (
          <div className={`fixed bottom-4 right-4 z-50 rounded-md px-4 py-3 text-sm text-white shadow-lg transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.message}
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6">
          {loading ? (
            <div className="py-12 text-center text-slate-500">Cargando cronograma...</div>
          ) : error ? (
            <div className="py-8 text-center">
              <div className="mb-4 text-red-500">{error}</div>
              <button onClick={loadCronograma} className="text-indigo-600 hover:underline">Reintentar</button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="mb-2 text-lg">No hay actividades planificadas aún.</p>
              {isAdmin && <p className="text-sm">Hacé clic en "+ Agregar Ítem" para comenzar.</p>}
            </div>
          ) : (
            <div className="relative border-l-2 border-indigo-100 ml-3 md:ml-6 space-y-8 py-4">
              {items.map((item) => {
                // Lógica súper básica de "en curso" solo para demostración visual
                // En un caso real se compararía también la fecha del evento.
                const isCurrent = nowTime >= item.horaInicio && nowTime <= (item.horaInicio.replace(/\d+$/, (m) => String(parseInt(m)+30))); // dummy logic
                
                return (
                  <div key={item.id} className="relative pl-6 md:pl-8">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white ${isCurrent ? 'bg-green-500 animate-pulse' : 'bg-indigo-400'}`}></div>
                    
                    <div className={`rounded-lg border p-4 transition-colors ${isCurrent ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-slate-800">{item.horaInicio}</span>
                            {item.duracionEstimada && (
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                {item.duracionEstimada}
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                En curso
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-medium text-slate-800">{item.actividad}</h3>
                          {item.responsable && (
                            <p className="text-sm text-slate-500 mt-1">
                              Resp: <span className="font-medium">{item.responsable}</span>
                            </p>
                          )}
                        </div>
                        
                        {isAdmin && (
                          <div className="flex items-center gap-3 mt-2 sm:mt-0">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-sm font-medium text-red-600 hover:text-red-900"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <CronogramaFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          item={editingItem}
        />
      )}
    </div>
  );
}
