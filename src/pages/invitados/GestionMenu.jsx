import { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { invitadosService } from '../../services/invitadosService';

export const GestionMenu = () => {
  const [dietas, setDietas] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [preciosLocales, setPreciosLocales] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [editingDietId, setEditingDietId] = useState(null);
  const [nuevoPrecio, setNuevoPrecio] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [dietasRes, resumenRes] = await Promise.all([
          invitadosService.getDietTypes(),
          invitadosService.getCateringSummary()
        ]);
        setDietas(dietasRes || []);
        setResumen(resumenRes || []);

        const preciosIniciales = {};
        (dietasRes || []).forEach(d => { preciosIniciales[d.id] = 0; });
        setPreciosLocales(preciosIniciales);
      } catch (error) {
        toast.error('Error al cargar datos del catering');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGuardarPrecio = (dietTypeId) => {
    setPreciosLocales(prev => ({ ...prev, [dietTypeId]: parseFloat(nuevoPrecio) || 0 }));
    setEditingDietId(null);
    setNuevoPrecio('');
    toast.success('Precio unitario actualizado');
  };

  const costoCateringTotal = useMemo(() => {
    return resumen.reduce((total, item) => {
      const precioUnitario = preciosLocales[item.dietTypeId] || 0;
      return total + (precioUnitario * item.totalConfirmed);
    }, 0);
  }, [resumen, preciosLocales]);

  if (isLoading) return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5853F]"></div></div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Toaster position="bottom-right" />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Cálculo de Catering</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 xl:col-span-2">
          <h2 className="text-lg font-extrabold text-gray-800 mb-4 uppercase tracking-wide">Definición de Precios Unitarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dietas.map(dieta => (
              <div key={dieta.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#B5853F] transition-colors">
                <span className="text-sm font-bold text-gray-700">{dieta.name}</span>
                {editingDietId === dieta.id ? (
                  <div className="flex items-center space-x-2">
                    <input type="number" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} className="w-24 border-2 border-[#B5853F] rounded p-1 text-sm font-bold focus:outline-none" placeholder="Precio" />
                    <button onClick={() => handleGuardarPrecio(dieta.id)} className="text-xs bg-[#B5853F] text-white font-bold px-3 py-1.5 rounded hover:bg-[#966D32] transition">Ok</button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <span className="font-extrabold text-gray-900">${(preciosLocales[dieta.id] || 0).toLocaleString('es-AR')}</span>
                    <button onClick={() => { setEditingDietId(dieta.id); setNuevoPrecio(preciosLocales[dieta.id]); }} className="text-xs font-bold text-[#B5853F] hover:text-[#966D32] uppercase tracking-wider transition-colors">Editar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-xl shadow-lg border-b-4 border-[#B5853F] flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#B5853F] uppercase tracking-widest">Costo Total de Catering</h2>
            <p className="text-xs text-gray-400 mt-1 font-medium">(Calculado sobre invitados confirmados)</p>
          </div>
          <div className="mt-6">
            <span className="text-5xl font-black text-[#CBA05F] tracking-tight">${costoCateringTotal.toLocaleString('es-AR')}</span>
          </div>
          <div className="text-xs font-semibold text-gray-300 mt-4 border-t border-gray-700 pt-3 flex justify-between">
            <span>Cubiertos facturados:</span>
            <span className="bg-gray-700 px-2 py-0.5 rounded text-[#CBA05F]">{resumen.reduce((acc, curr) => acc + curr.totalConfirmed, 0)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-gray-800 max-w-md">
        <div className="flex justify-between items-center mb-5 border-b pb-3">
          <h2 className="text-lg font-extrabold text-gray-900 uppercase tracking-wide">📋 Orden de Cocina</h2>
          <button onClick={() => window.print()} className="text-xs bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded hover:bg-gray-200 transition">Imprimir</button>
        </div>
        <div className="space-y-3">
          {resumen.map(res => (
            <div key={res.dietTypeId} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
              <span className="font-bold text-gray-800">{res.dietTypeName}</span>
              <span className="bg-[#F8F1E7] text-[#966D32] border border-[#B5853F] px-3 py-1 rounded font-extrabold text-sm">
                {res.totalConfirmed} platos
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};