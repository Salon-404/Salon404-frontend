import { useState, useEffect } from 'react';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../../services/proveedoresService';
import ProveedorFormModal from '../../components/proveedores/ProveedorFormModal';

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);

  // Estado para feedback (toast simple)
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadProveedores = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProveedores();
      setProveedores(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProveedores();
  }, []);

  const handleOpenNew = () => {
    setEditingProveedor(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proveedor) => {
    setEditingProveedor(proveedor);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el proveedor "${nombre}"?`)) {
      return;
    }
    
    try {
      await deleteProveedor(id);
      showToast('Proveedor eliminado correctamente');
      setProveedores(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      showToast(err.message || 'Error al eliminar', 'error');
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingProveedor) {
        const updated = await updateProveedor(editingProveedor.id, data);
        setProveedores(prev => prev.map(p => p.id === updated.id ? updated : p));
        showToast('Proveedor actualizado correctamente');
      } else {
        const newProv = await createProveedor(data);
        setProveedores(prev => [...prev, newProv]);
        showToast('Proveedor creado correctamente');
      }
    } catch (err) {
      showToast(err.message || 'Error al guardar', 'error');
      throw err; // Para que el modal no se cierre
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Proveedores</h1>
            <p className="text-sm text-slate-500">Administra los proveedores vinculados al sistema.</p>
          </div>
          <button
            onClick={handleOpenNew}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            + Nuevo Proveedor
          </button>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed bottom-4 right-4 z-50 rounded-md px-4 py-3 text-sm text-white shadow-lg transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.message}
          </div>
        )}

        {/* Contenido principal */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Cargando proveedores...</div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="mb-4 text-red-500">{error}</div>
              <button onClick={loadProveedores} className="text-indigo-600 hover:underline">Intentar nuevamente</button>
            </div>
          ) : proveedores.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No hay proveedores registrados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Nombre</th>
                    <th className="px-6 py-4 font-medium">Rubro</th>
                    <th className="px-6 py-4 font-medium">Contacto</th>
                    <th className="px-6 py-4 font-medium text-center">Estado</th>
                    <th className="px-6 py-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proveedores.map((prov) => (
                    <tr key={prov.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {prov.nombre}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                          {prov.rubro}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>{prov.email}</div>
                        <div className="text-xs text-slate-400">{prov.telefono}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {prov.activo ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(prov)}
                          className="mr-3 font-medium text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(prov.id, prov.nombre)}
                          className="font-medium text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ProveedorFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        proveedor={editingProveedor} 
      />
    </div>
  );
}
