import React from "react";

export default function GraficoReservas({ datosGrafico }) {
  const series = datosGrafico?.series || {
    reservas: [],
    completados: [],
    cancelados: [],
  };
  const labels = datosGrafico?.labels || [];

  // Encontramos el valor máximo para calcular la altura proporcional de las barras en el mock
  const maxValor = Math.max(
    ...series.reservas,
    ...series.completados,
    ...series.cancelados,
    1,
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="mb-4 text-left">
        <h4 className="text-md font-semibold text-gray-700">
          Flujo Mensual Operativo
        </h4>
        <p className="text-xs text-gray-400">
          Comparativa visual de actividad, cierres y cancelaciones en tiempo
          real.
        </p>
      </div>

      {/* Referencias de la Leyenda */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs font-medium text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-indigo-600 rounded-sm inline-block"></span>
          <span>📅 Reservas Activas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-emerald-500 rounded-sm inline-block"></span>
          <span>✅ Completados</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-rose-500 rounded-sm inline-block"></span>
          <span>❌ Cancelados</span>
        </div>
      </div>

      {/* Contenedor del Gráfico Simulado (Agregado pt-6 para dar espacio a los números de arriba) */}
      <div className="flex-1 flex items-end justify-between gap-2 pt-6 h-64 border-b border-gray-100 pb-2 overflow-x-auto min-w-[500px]">
        {labels.map((mes, index) => {
          const valReserva = series.reservas[index] || 0;
          const valCompletado = series.completados[index] || 0;
          const valCancelado = series.cancelados[index] || 0;

          return (
            <div key={mes} className="flex flex-col items-center flex-1 group">
              {/* Grupo de Barras del Mes */}
              <div className="flex items-end gap-1.5 h-44 w-full justify-center">
                {/* COLUMNA: Reservas */}
                <div className="flex flex-col items-center justify-end h-full flex-1 max-w-[14px]">
                  {/* Número superior (Solo se renderiza si es > 0) */}
                  {valReserva > 0 && (
                    <span className="text-[9px] font-bold text-indigo-600 mb-1 animate-fadeIn">
                      {valReserva}
                    </span>
                  )}
                  <div
                    style={{ height: `${(valReserva / maxValor) * 100}%` }}
                    className="w-full bg-indigo-600 rounded-t-sm min-h-[3px] transition-all duration-300 relative group-hover:opacity-80"
                    title={`Reservas: ${valReserva}`}
                  ></div>
                </div>

                {/* COLUMNA: Completados */}
                <div className="flex flex-col items-center justify-end h-full flex-1 max-w-[14px]">
                  {/* Número superior */}
                  {valCompletado > 0 && (
                    <span className="text-[9px] font-bold text-emerald-600 mb-1 animate-fadeIn">
                      {valCompletado}
                    </span>
                  )}
                  <div
                    style={{ height: `${(valCompletado / maxValor) * 100}%` }}
                    className="w-full bg-emerald-500 rounded-t-sm min-h-[3px] transition-all duration-300 relative group-hover:opacity-80"
                    title={`Completados: ${valCompletado}`}
                  ></div>
                </div>

                {/* COLUMNA: Cancelados */}
                <div className="flex flex-col items-center justify-end h-full flex-1 max-w-[14px]">
                  {/* Número superior */}
                  {valCancelado > 0 && (
                    <span className="text-[9px] font-bold text-rose-600 mb-1 animate-fadeIn">
                      {valCancelado}
                    </span>
                  )}
                  <div
                    style={{ height: `${(valCancelado / maxValor) * 100}%` }}
                    className="w-full bg-rose-500 rounded-t-sm min-h-[3px] transition-all duration-300 relative group-hover:opacity-80"
                    title={`Cancelados: ${valCancelado}`}
                  ></div>
                </div>
              </div>

              {/* Etiqueta del Mes */}
              <span className="text-[10px] font-semibold text-gray-400 mt-2">
                {mes}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
