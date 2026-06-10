import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TarjetasAdmin from "../../components/dashboard/TarjetasAdmin";
import GraficoReservas from "../../components/dashboard/GraficoReservas";
import Swal from "sweetalert2";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. ESTADO PARA LA OPCIÓN SELECCIONADA DEL MENÚ
  // 'metricas' | 'reservas' | 'mesas' (u otras opciones que agregues)
  const [opcionActiva, setOpcionActiva] = useState("metricas");

  useEffect(() => {
    const fetchMetricasAdmin = () => {
      // Buscá esta sección dentro de tu useEffect en DashboardPage.jsx y reemplazala:
      const mockData = {
        totalEventos: 12, // 12 fiestas contratadas para este mes
        mesPico: "Noviembre", // El mes con más reservas de salón completo
        eventoLider: "Casamientos", // El formato que más se vende

        // Listado de eventos expuestos a imprevistos de salón
        reservasGestion: [
          {
            id: 201,
            cliente: "Familia Benítez",
            info: "Fiesta de 15 Años • 120 Invitados • Sáb 13/06",
            estado: "Confirmado",
          },
          {
            id: 202,
            cliente: "Sofía & Marcos",
            info: "Boda / Casamiento • 200 Invitados • Sáb 20/06",
            estado: "Confirmado",
          },
          {
            id: 203,
            cliente: "Tech Solutions S.A.",
            info: "Cena Corporativa • 80 Invitados • Vie 26/06",
            estado: "Confirmado",
          },
        ],

        // Gráfico anual: Cuántos eventos hay reservados por mes para ver la proyección del año
        grafico: {
          labels: [
            "Ene",
            "Feb",
            "Mar",
            "Abr",
            "May",
            "Jun",
            "Jul",
            "Ago",
            "Sep",
            "Oct",
            "Nov",
            "Dic",
          ],
          valores: [2, 4, 5, 3, 6, 12, 4, 2, 7, 9, 15, 14], // Cantidad de fiestas por mes
        },
      };
      setData(mockData);
      setLoading(false);
    };

    fetchMetricasAdmin();
  }, []);

  // Funciones de gestión express para imprevistos
  const handleCancelarReserva = (id, cliente) => {
    Swal.fire({
      title: `¿Cancelar la reserva de ${cliente}?`,
      text: "Esta acción cancelara la reserva inmediatamente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Atrás",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Cancelada", "La reserva fue dada de baja.", "success");
        setData((prev) => ({
          ...prev,
          reservasGestion: prev.reservasGestion.filter((r) => r.id !== id),
        }));
      }
    });
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-500 font-medium">
          Cargando control de administración...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestión exclusiva de administración para EventosPro.
        </p>
      </div>

      {/* Indicadores numéricos siempre visibles arriba */}
      <TarjetasAdmin metricas={data} />

      {/* ========================================================================= */}
      {/* MENÚ DE OPCIONES (TABS) INTERACTIVO                                      */}
      {/* ========================================================================= */}
      <div className="flex border-b border-gray-200 mb-6 gap-2">
        <button
          onClick={() => setOpcionActiva("metricas")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            opcionActiva === "metricas"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          📊 Ver Métricas
        </button>

        <button
          onClick={() => setOpcionActiva("reservas")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            opcionActiva === "reservas"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          📋 Gestión de Reservas
        </button>

        {/* ESPACIO LISTO PARA AGREGAR MÁS OPCIONES EN EL FUTURO */}
        <button
          onClick={() => setOpcionActiva("mesas")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            opcionActiva === "mesas"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          🪑 Estado del Plano
        </button>
      </div>

      {/* ========================================================================= */}
      {/* RENDERIZADO CONDICIONAL SEGÚN LA OPCIÓN SELECCIONADA                     */}
      {/* ========================================================================= */}

      {/* Opcion A: Se muestran solo las Métricas */}
      {opcionActiva === "metricas" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          <div className="lg:col-span-2">
            <GraficoReservas datosGrafico={data?.grafico} />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-center">
            <p className="text-sm text-gray-400">
              Espacio para otros gráficos (ej: ingresos o formatos de salón más
              pedidos).
            </p>
          </div>
        </div>
      )}

      {/* Opcion B: Se muestra solo el centro de imprevistos de Reservas */}
      {opcionActiva === "reservas" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-4xl animate-fadeIn">
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-700">
              Imprevistos en Vivo
            </h4>
            <p className="text-xs text-gray-400">
              Modificá o cancelá reservas activas ante eventualidades de último
              momento.
            </p>
          </div>

          <div className="space-y-3">
            {data?.reservasGestion.map((reserva) => (
              <div
                key={reserva.id}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 text-sm">
                      {reserva.cliente}
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase">
                      {reserva.estado}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{reserva.info}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/reservas/${reserva.id}/editar`)}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-600 rounded-lg text-xs font-medium transition-all shadow-sm"
                  >
                    ✏️ Re-programar
                  </button>
                  <button
                    onClick={() =>
                      handleCancelarReserva(reserva.id, reserva.cliente)
                    }
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition-all"
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opcion C: Espacio preparado para otra sección nueva */}
      {opcionActiva === "mesas" && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-4xl text-center animate-fadeIn">
          <p className="text-gray-500 font-medium">
            Acá vas a poder incrustar una vista rápida del estado de las mesas.
          </p>
          <button
            onClick={() => navigate("/mesas")}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl transition-all shadow-sm"
          >
            Ir al Plano Completo
          </button>
        </div>
      )}
    </div>
  );
}
