import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { invitadosService } from '../../services/invitadosService';

const ESTADOS = { 1: 'Pendiente', 2: 'Confirmado', 3: 'Rechazado' };

export const InvitadosPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [invitados, setInvitados] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [dietas, setDietas] = useState([]);
  
  const [editingInvitado, setEditingInvitado] = useState(null);
  const [invitadoAEliminar, setInvitadoAEliminar] = useState(null);

  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterDiet, setFilterDiet] = useState('todos');
  const [filterMesa, setFilterMesa] = useState('todos');

  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [invitadosRes, mesasRes, dietasRes] = await Promise.all([
        invitadosService.getInvitados(),
        invitadosService.getMesas(),
        invitadosService.getDietTypes()
      ]);
      setInvitados(invitadosRes.data || []);
      setMesas(mesasRes || []);
      setDietas(dietasRes || []);
    } catch (error) {
      toast.error('Error al cargar la información del servidor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (editingInvitado) {
      setValue("fullName", editingInvitado.fullName);
      setValue("email", editingInvitado.email);
      setValue("phone", editingInvitado.phone);
      setValue("guestStatusId", editingInvitado.guestStatusId.toString());
      setValue("dietTypeId", editingInvitado.dietTypeId.toString());
      setValue("tableId", editingInvitado.tableId || ""); 
    } else {
      reset();
    }
  }, [editingInvitado, setValue, reset]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    const payload = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      dietTypeId: parseInt(data.dietTypeId),
      guestStatusId: parseInt(data.guestStatusId) || 1,
      tableId: data.tableId ? data.tableId : null
    };

    try {
      if (editingInvitado) {
        await invitadosService.actualizarInvitado(editingInvitado.id, payload);
        toast.success('Invitado actualizado correctamente');
      } else {
        await invitadosService.crearInvitado(payload);
        toast.success('Invitado agregado exitosamente');
      }
      await fetchData();
      cerrarModal();
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(error.response.data.detail || 'La mesa seleccionada está llena');
      } else {
        toast.error('Ocurrió un error al guardar');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const confirmarEliminacion = async () => {
    try {
      await invitadosService.eliminarInvitado(invitadoAEliminar);
      toast.success('Invitado eliminado');
      await fetchData();
    } catch (error) {
      toast.error('Error al eliminar el invitado');
    } finally {
      setInvitadoAEliminar(null);
    }
  };

  const cerrarModal = () => { setIsModalOpen(false); setEditingInvitado(null); reset(); };

  const invitadosFiltrados = invitados.filter((inv) => {
    const cumpleStatus = filterStatus === 'todos' || inv.guestStatusId === parseInt(filterStatus);
    const cumpleDiet = filterDiet === 'todos' || inv.dietTypeId === parseInt(filterDiet);
    const cumpleMesa = filterMesa === 'todos' || (filterMesa === 'sin_asignar' ? inv.tableId === null : inv.tableId === filterMesa);
    return cumpleStatus && cumpleDiet && cumpleMesa;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen relative">
      <Toaster position="bottom-right" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Invitados</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#B5853F] text-white px-4 py-2 rounded-md hover:bg-[#966D32] transition font-medium shadow-md">
          + Agregar Invitado
        </button>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-5 items-center">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border rounded-md p-2 text-sm bg-gray-50 focus:ring-[#B5853F] focus:border-[#B5853F]">
            <option value="todos">Todos</option>
            <option value="1">Pendiente</option><option value="2">Confirmado</option><option value="3">Rechazado</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-500 uppercase mb-1">Dieta</label>
          <select value={filterDiet} onChange={(e) => setFilterDiet(e.target.value)} className="border rounded-md p-2 text-sm bg-gray-50 focus:ring-[#B5853F] focus:border-[#B5853F]">
            <option value="todos">Todas</option>
            {dietas.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-500 uppercase mb-1">Mesa</label>
          <select value={filterMesa} onChange={(e) => setFilterMesa(e.target.value)} className="border rounded-md p-2 text-sm bg-gray-50 focus:ring-[#B5853F] focus:border-[#B5853F]">
            <option value="todos">Mostrar todas</option>
            <option value="sin_asignar">Sin asignar</option>
            {mesas.map(m => <option key={m.id} value={m.id}>{m.tableName}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5853F]"></div></div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Contacto</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Dieta / Mesa</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invitadosFiltrados.map((invitado) => (
                <tr key={invitado.id} className="hover:bg-[#F8F1E7]/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{invitado.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{invitado.email} <br/><span className="text-gray-500">{invitado.phone}</span></td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full ${invitado.guestStatusId === 2 ? 'bg-green-100 text-green-800' : invitado.guestStatusId === 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {ESTADOS[invitado.guestStatusId]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="block font-medium">{invitado.dietTypeName}</span>
                    <span className="text-xs text-[#B5853F] font-semibold">{invitado.tableName || 'Sin asignar'}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button onClick={() => { setEditingInvitado(invitado); setIsModalOpen(true); }} className="text-[#B5853F] hover:text-[#966D32] font-bold mr-4">Editar</button>
                    <button onClick={() => setInvitadoAEliminar(invitado.id)} className="text-red-500 hover:text-red-700 font-bold">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border-t-4 border-[#B5853F]">
            <h2 className="text-2xl font-extrabold mb-6 text-gray-900">{editingInvitado ? 'Editar Invitado' : 'Nuevo Invitado'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">Nombre Completo</label>
                <input {...register("fullName", { required: true })} className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 focus:ring-[#B5853F] focus:border-[#B5853F]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700">Email</label><input type="email" {...register("email")} className="mt-1 block w-full border rounded-md p-2.5 focus:ring-[#B5853F] focus:border-[#B5853F]" /></div>
                <div><label className="block text-sm font-bold text-gray-700">Teléfono</label><input {...register("phone")} className="mt-1 block w-full border rounded-md p-2.5 focus:ring-[#B5853F] focus:border-[#B5853F]" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700">Estado</label>
                  <select {...register("guestStatusId")} className="mt-1 block w-full border rounded-md p-2.5 focus:ring-[#B5853F] focus:border-[#B5853F]">
                    <option value="1">Pendiente</option><option value="2">Confirmado</option><option value="3">Rechazado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">Tipo de Dieta</label>
                  <select {...register("dietTypeId")} className="mt-1 block w-full border rounded-md p-2.5 focus:ring-[#B5853F] focus:border-[#B5853F]">
                    {dietas.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 border-t pt-4 mt-2">Mesa Asignada</label>
                <select {...register("tableId")} className="mt-1 block w-full border border-[#B5853F] bg-[#F8F1E7] rounded-md p-2.5 focus:ring-[#B5853F] focus:border-[#B5853F] font-medium">
                  <option value="">-- Sin asignar --</option>
                  {mesas.map(m => <option key={m.id} value={m.id}>{m.tableName} ({m.guests?.length || 0}/{m.capacity})</option>)}
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-100">
                <button type="button" onClick={cerrarModal} disabled={isSaving} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-md hover:bg-gray-200">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-[#B5853F] text-white font-bold rounded-md hover:bg-[#966D32] shadow-md disabled:opacity-50">
                  {isSaving ? 'Guardando...' : (editingInvitado ? 'Guardar Cambios' : 'Guardar Invitado')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {invitadoAEliminar && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center border-t-4 border-red-500">
            <h3 className="text-xl font-extrabold text-gray-900 mb-2 mt-4">Eliminar Invitado</h3>
            <p className="text-sm text-gray-600 mb-6 font-medium">¿Estás seguro? Esta acción no se puede deshacer.</p>
            <div className="flex justify-center space-x-3">
              <button onClick={() => setInvitadoAEliminar(null)} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md font-bold w-full">Cancelar</button>
              <button onClick={confirmarEliminacion} className="px-4 py-2 bg-red-600 text-white rounded-md font-bold w-full shadow-md">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};