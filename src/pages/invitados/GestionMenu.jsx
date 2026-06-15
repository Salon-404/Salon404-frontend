import { useState, useMemo } from 'react';

const mockPreciosPorDieta = [
  { dietTypeId: 1, name: 'Menú Tradicional (Sin restricciones)', price: 8000 },
  { dietTypeId: 2, name: 'Menú Vegetariano', price: 6500 },
  { dietTypeId: 3, name: 'Menú Vegano', price: 6500 },
  { dietTypeId: 4, name: 'Menú Celíaco', price: 8500 },
];

const mockInvitados = [
  { id: '1', fullName: 'Juan Pérez', guestStatusId: 2, dietTypeId: 1 },
  { id: '2', fullName: 'María Gómez', guestStatusId: 2, dietTypeId: 3 },
  { id: '3', fullName: 'Carlos López', guestStatusId: 1, dietTypeId: 4 },
  { id: '4', fullName: 'Laura Martínez', guestStatusId: 2, dietTypeId: 1 },
];

const ESTADOS = { 1: 'Pendiente', 2: 'Confirmado', 3: 'Rechazado' };
const DIETAS = { 1: 'Sin restricciones', 2: 'Vegetariano', 3: 'Vegano', 4: 'Celíaco' };

export const GestionMenu = () => {
  const [precios, setPrecios] = useState(mockPreciosPorDieta);
  const [invitados] = useState(mockInvitados);
  const [editingDietId, setEditingDietId] = useState(null);
  const [nuevoPrecio, setNuevoPrecio] = useState('');

  const handleGuardarPrecio = (dietTypeId) => {
    setPrecios(prev => prev.map(p => 
      p.dietTypeId === dietTypeId ? { ...p, price: parseFloat(nuevoPrecio) || 0 } : p
    ));
    setEditingDietId(null);
    setNuevoPrecio('');
  };

  const costoCateringTotal = useMemo(() => {
    return invitados
      .filter(inv => inv.guestStatusId === 2)
      .reduce((total, inv) => {
        const precioDieta = precios.find(p => p.dietTypeId === inv.dietTypeId);
        return total + (precioDieta ? precioDieta.price : 0);
      }, 0);
  }, [invitados, precios]);

  const resumenProveedor = useMemo(() => {
    return precios.map(p => {
      const cantidadConfirmados = invitados.filter(inv => inv.guestStatusId === 2 && inv.dietTypeId === p.dietTypeId).length;
      return { ...p, cantidad: cantidadConfirmados };
    });
  }, [invitados, precios]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión del Menú y Catering</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        
        {/* Panel de Precios */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 xl:col-span-2">
          <h2 className="text-lg font-extrabold text-gray-800 mb-4 uppercase tracking-wide">Definición de Precios Unitarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {precios.map(p => (
              <div key={p.dietTypeId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-amber-300 transition-colors">
                <span className="text-sm font-bold text-gray-700">{p.name}</span>
                {editingDietId === p.dietTypeId ? (
                  <div className="flex items-center space-x-2">
                    <input type="number" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} className="w-24 border-2 border-amber-500 rounded p-1 text-sm font-bold focus:outline-none" placeholder="Precio" />
                    <button onClick={() => handleGuardarPrecio(p.dietTypeId)} className="text-xs bg-amber-600 text-white font-bold px-3 py-1.5 rounded hover:bg-amber-700 transition">Ok</button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <span className="font-extrabold text-gray-900">${p.price.toLocaleString('es-AR')}</span>
                    <button onClick={() => { setEditingDietId(p.dietTypeId); setNuevoPrecio(p.price); }} className="text-xs font-bold text-amber-600 hover:text-amber-800 uppercase tracking-wider transition-colors">Editar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Costo Total - DEGRADADO OSCURO CON DORADO */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-xl shadow-lg border-b-4 border-amber-500 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Costo Total de Catering</h2>
            <p className="text-xs text-gray-400 mt-1 font-medium">(Calculado en base a invitados confirmados)</p>
          </div>
          <div className="mt-6">
            <span className="text-5xl font-black text-amber-400 tracking-tight">${costoCateringTotal.toLocaleString('es-AR')}</span>
          </div>
          <div className="text-xs font-semibold text-gray-300 mt-4 border-t border-gray-700 pt-3 flex justify-between">
            <span>Cubiertos facturados:</span>
            <span className="bg-gray-700 px-2 py-0.5 rounded text-amber-400">{invitados.filter(i => i.guestStatusId === 2).length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Tabla Lectura */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-xl font-extrabold text-gray-900 mb-5 border-b pb-2">Revisión de Asignación</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase tracking-wider">Invitado</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase tracking-wider">Estado de Asistencia</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase tracking-wider">Dieta Registrada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {invitados.map(inv => (
                  <tr key={inv.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-4 py-4 font-bold text-gray-800">{inv.fullName}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide
                        ${inv.guestStatusId === 2 ? 'bg-green-100 text-green-800' : 
                          inv.guestStatusId === 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {ESTADOS[inv.guestStatusId]}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-600">{DIETAS[inv.dietTypeId]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen del Proveedor */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-gray-800 h-max">
          <div className="flex justify-between items-center mb-5 border-b pb-3">
            <h2 className="text-lg font-extrabold text-gray-900 uppercase tracking-wide">📋 Orden de Cocina</h2>
            <button onClick={() => window.print()} className="text-xs bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded hover:bg-gray-200 transition">Imprimir</button>
          </div>
          
          <div className="space-y-3">
            {resumenProveedor.map(res => (
              <div key={res.dietTypeId} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                <span className="font-bold text-gray-800">{res.name}</span>
                <span className={`${res.cantidad > 0 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-200 text-gray-500'} px-3 py-1 rounded font-extrabold text-sm`}>
                  {res.cantidad} platos
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 font-medium">
            <strong className="text-amber-700 uppercase tracking-wider block mb-1">Nota:</strong> 
            Los platos a preparar reflejan únicamente a los invitados cuyo estado es "Confirmado".
          </div>
        </div>
      </div>
    </div>
  );
};