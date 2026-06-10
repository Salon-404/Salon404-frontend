import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registramos los componentes internos que necesita Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function GraficoReservas({ datosGrafico }) {
  const data = {
    labels: datosGrafico?.labels || [
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
    datasets: [
      {
        label: "Reservas Concretadas",
        data: datosGrafico?.valores || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(79, 70, 229, 0.85)", // Indigo de Tailwind
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#6b7280" },
        grid: { color: "#f3f4f6" },
      },
      x: {
        ticks: { color: "#6b7280" },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
      <h4 className="text-md font-semibold text-gray-700 mb-4">
        Flujo Mensual de Reservas
      </h4>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
