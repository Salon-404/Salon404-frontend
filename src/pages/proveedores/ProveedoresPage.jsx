import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { obtenerProveedores } from "../../services/proveedoresService";

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id: eventoId } = useParams();

  useEffect(() => {
    const fetchProveedores = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await obtenerProveedores();
        const lista = Array.isArray(data) ? data : data?.items ?? [];
        setProveedores(lista);
      } catch (err) {
        setError("Error al cargar los proveedores.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProveedores();
  }, []);

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
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}