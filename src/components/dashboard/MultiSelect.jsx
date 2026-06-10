import React, { useState, useEffect, useRef } from "react";

export default function MultiSelect({
  opciones,
  opcionesSeleccionadas,
  onChange,
  titulo = "Seleccionar opciones",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar el menú si el usuario hace click afuera del componente
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleOption = (id) => {
    if (opcionesSeleccionadas.includes(id)) {
      // Si ya está seleccionada, la sacamos
      onChange(opcionesSeleccionadas.filter((item) => item !== id));
    } else {
      // Si no está, la agregamos
      onChange([...opcionesSeleccionadas, id]);
    }
  };

  return (
    <div
      className="relative inline-block text-left w-full sm:w-64"
      ref={dropdownRef}
    >
      {/* Botón del Menú */}
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-between items-center w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        >
          <span className="truncate">
            {opcionesSeleccionadas.length === 0
              ? titulo
              : `${titulo} (${opcionesSeleccionadas.length})`}
          </span>
          <svg
            className="ml-2 h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Desplegable de Opciones */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-full rounded-xl bg-white shadow-lg border border-gray-100 ring-1 ring-black ring-opacity-5 z-50 max-h-60 overflow-y-auto">
          <div className="p-2 space-y-1">
            {opciones.map((opcion) => {
              const estaSeleccionado = opcionesSeleccionadas.includes(
                opcion.id,
              );
              return (
                <label
                  key={opcion.id}
                  className={`flex items-center px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                    estaSeleccionado
                      ? "bg-indigo-50 text-indigo-900"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={estaSeleccionado}
                    onChange={() => handleToggleOption(opcion.id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-3 cursor-pointer"
                  />
                  <span className="font-medium">{opcion.nombre}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
