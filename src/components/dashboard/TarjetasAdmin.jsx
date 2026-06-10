import React from "react";

export default function TarjetasAdmin({ metricas }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Tarjeta 1: Volumen de negocio */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <span className="text-sm font-medium text-gray-400">
          Eventos Confirmados (Mes)
        </span>
        <h3 className="text-3xl font-bold text-gray-800 mt-2">
          {metricas?.totalEventos || 0}{" "}
          <span className="text-sm font-normal text-gray-400">fechas</span>
        </h3>
        <p className="text-[11px] text-gray-400 mt-1">
          Reservas con seña registrada en el sistema.
        </p>
      </div>

      {/* Tarjeta 2: Temporada alta */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <span className="text-sm font-medium text-gray-400">
          Mes con Mayor Demanda
        </span>
        <h3 className="text-3xl font-bold text-indigo-600 mt-2">
          {metricas?.mesPico || "N/A"}
        </h3>
        <p className="text-[11px] text-gray-400 mt-1">
          Mes del año con el calendario más comprometido.
        </p>
      </div>

      {/* Tarjeta 3: Preferencia del cliente */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <span className="text-sm font-medium text-gray-400">
          Tipo de Evento más Solicitado
        </span>
        <h3 className="text-3xl font-bold text-emerald-600 mt-2">
          {metricas?.eventoLider || "N/A"}
        </h3>
        <p className="text-[11px] text-gray-400 mt-1">
          Representa la mayor parte de las contrataciones actuales.
        </p>
      </div>
    </div>
  );
}
