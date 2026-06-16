import React, { useEffect, useState } from "react";
import { getProveedores, asignarProveedor } from "../../services/proveedoresService";
import { useAuth } from "../../context/AuthContext";

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // SIMULACIÓN DE DATOS COMO EN PagosPage e InvitadosPage
  const [eventoId] = useState(1); // MOCK: hardcodeado como en las otras páginas cliente por ahora

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const data = await getProveedores();
        setProveedores(data);
      } catch (err) {
        setError("Error al cargar los proveedores.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProveedores();
  }, []);

  const handleSeleccionar = async (provId) => {
    try {
      await asignarProveedor(eventoId, provId);
      alert("Proveedor asignado correctamente al evento.");
    } catch (err) {
      console.error(err);
      alert("Error al asignar el proveedor.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-6">Gestionar Proveedores</h1>
      
      {loading ? (
        <p className="text-slate-500">Cargando proveedores...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid gap-6">
          {proveedores.length === 0 ? (
            <p className="text-slate-500">No hay proveedores disponibles.</p>
          ) : (
            proveedores.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center transition-shadow hover:shadow-md">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{p.name}</h2>
                  <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mt-1">{p.serviceType}</p>
                  <p className="text-slate-600 mt-2">{p.description}</p>
                  <div className="mt-2 text-sm text-slate-500">
                    <span className="mr-4"><strong>Email:</strong> {p.email}</span>
                    <span><strong>Teléfono:</strong> {p.phone}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleSeleccionar(p.id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm ml-4 whitespace-nowrap"
                >
                  Seleccionar
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
