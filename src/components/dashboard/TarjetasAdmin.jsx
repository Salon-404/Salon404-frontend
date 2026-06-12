import React from "react";

export default function TarjetasAdmin({ metricas }) {
  // Tomamos los datos del objeto metricas que viene del DashboardPage
  const confirmados = metricas?.totalConfirmados || 0;
  const completados = metricas?.completados || 0;

  // Calculamos el volumen global sumando ambos estados vigentes/históricos
  const totalPeriodo = confirmados + completados;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Tarjeta 1: Eventos Confirmados */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between text-left">
        <span className="text-sm font-medium text-gray-400">
          Eventos Confirmados
        </span>
        <h3 className="text-3xl font-bold text-indigo-600 mt-2">
          {confirmados}{" "}
          <span className="text-sm font-normal text-gray-400">fechas</span>
        </h3>
        <p className="text-[11px] text-gray-400 mt-1">
          Contratos vigentes con seña activa en el año seleccionado.
        </p>
      </div>

      {/* Tarjeta 2: Cierres Exitosos */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between text-left">
        <span className="text-sm font-medium text-gray-400">
          Cierres Exitosos
        </span>
        <h3 className="text-3xl font-bold text-emerald-600 mt-2">
          {completados}{" "}
          <span className="text-sm font-normal text-gray-400">realizados</span>
        </h3>
        <p className="text-[11px] text-gray-400 mt-1">
          Fiestas ejecutadas e historial comercial archivado.
        </p>
      </div>

      {/* Tarjeta 3: Total del Período */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between text-left">
        <span className="text-sm font-medium text-gray-400">
          Total del Período
        </span>
        <h3 className="text-3xl font-bold text-gray-800 mt-2">
          {totalPeriodo}{" "}
          <span className="text-sm font-normal text-gray-400">eventos</span>
        </h3>
        <p className="text-[11px] text-gray-400 mt-1">
          Volumen global de actividad (Confirmados + Completados).
        </p>
      </div>
    </div>
  );
}
