// src/components/proveedores/Proveedores.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // <-- Importamos createPortal
import {
  obtenerProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
} from "../../services/proveedoresService";
import { obtenerTiposdeProveedores } from "../../services/providerCatalogService";

const MAPA_RUBROS = {
  1: "DJ",
  2: "Catering",
  3: "Fotografía",
  4: "Decoración",
  5: "Animación",
  6: "Iluminación",
  7: "Sonido"
};

const TIPOS_FALLBACK = [
  { id: 1, name: "DJ" },
  { id: 2, name: "Catering" },
  { id: 3, name: "Fotografía" },
  { id: 4, name: "Decoración" },
  { id: 5, name: "Animación" },
  { id: 6, name: "Iluminación" },
  { id: 7, name: "Sonido" }
];

const ESTADOS_FALLBACK = [
  { id: 1, name: "Disponible" },
  { id: 2, name: "Reservado" },
  { id: 3, name: "Inactivo" }
];

export default function Proveedores() {
  // Estados para los datos y el control de la API
  const [proveedores, setProveedores] = useState([]);
  const [tiposProveedor, setTiposProveedor] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para la paginación y filtros
  const [pagina, setPagina] = useState(1);
  const [porPagina] = useState(10);
  const [tipoProveedor, setTipoProveedor] = useState("");
  const [tieneMas, setTieneMas] = useState(true);

  // --- ESTADOS PARA MODAL DE EDICIÓN / CREACIÓN ---
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idProveedorSeleccionado, setIdProveedorSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const estadoInicialForm = {
    name: "",
    providerTypeId: "",
    providerStatusId: 1,
    email: "",
    phone: "",
    price: "",
    supportsVegetarian: false,
    supportsVegan: false,
    supportsGlutenFree: false,
  };
  const [nuevoProveedor, setNuevoProveedor] = useState(estadoInicialForm);

  // --- ESTADOS PARA CONFIRMACIÓN DE ELIMINACIÓN ---
  const [mostrarConfirmarEliminar, setMostrarConfirmarEliminar] =
    useState(false);
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Cargar catálogo de tipos de proveedores
  useEffect(() => {
    const cargarTipos = async () => {
      try {
        const respuesta = await obtenerTiposdeProveedores();
        const datosTipos = respuesta?.data || respuesta || [];
        setTiposProveedor(Array.isArray(datosTipos) && datosTipos.length > 0 ? datosTipos : TIPOS_FALLBACK);
      } catch (error) {
        console.error("Error al cargar los tipos de proveedores, usando fallback:", error);
        setTiposProveedor(TIPOS_FALLBACK);
      }
    };
    cargarTipos();
  }, []);

  // Cargar los datos de los proveedores
  const cargarDatos = async () => {
    setCargando(true);
    try {
      const respuesta = await obtenerProveedores(
        pagina,
        porPagina,
        tipoProveedor,
      );
      const datos = respuesta?.data?.data || respuesta?.data || respuesta || [];
      let proveedoresValidos = Array.isArray(datos) ? datos : [];
      // Client-side fallback filtering by provider type in case the backend returns all
      if (tipoProveedor) {
        proveedoresValidos = proveedoresValidos.filter(
          (p) => (p.type ?? p.providerTypeId ?? 0).toString() === tipoProveedor.toString()
        );
      }
      setProveedores(proveedoresValidos);
      setTieneMas(proveedoresValidos.length === porPagina);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      setProveedores([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [pagina, tipoProveedor, porPagina]);

  const handleFiltroChange = (e) => {
    setTipoProveedor(e.target.value);
    setPagina(1);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoProveedor((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setIdProveedorSeleccionado(null);
    setNuevoProveedor(estadoInicialForm);
    setMostrarModal(true);
  };

  const abrirModalEditar = (proveedor) => {
    setModoEdicion(true);
    setIdProveedorSeleccionado(proveedor.id);
    setNuevoProveedor({
      name: proveedor.name || "",
      providerTypeId:
        (proveedor.providerTypeId ?? proveedor.type) != null
          ? (proveedor.providerTypeId ?? proveedor.type).toString()
          : "",
      providerStatusId: proveedor.providerStatusId ?? proveedor.status ?? 1,
      email: proveedor.email || "",
      phone: proveedor.phone || "",
      price: proveedor.price != null ? proveedor.price.toString() : "",
      supportsVegetarian: !!proveedor.supportsVegetarian,
      supportsVegan: !!proveedor.supportsVegan,
      supportsGlutenFree: !!proveedor.supportsGlutenFree,
    });
    setMostrarModal(true);
  };

  const handleIntentarEliminar = (e, proveedor) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setProveedorAEliminar(proveedor);
    setMostrarConfirmarEliminar(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!proveedorAEliminar || !proveedorAEliminar.id) return;
    setEliminando(true);
    try {
      await eliminarProveedor(proveedorAEliminar.id);
      setMostrarConfirmarEliminar(false);
      setProveedorAEliminar(null);
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
      alert("Hubo un error al intentar eliminar al proveedor.");
    } finally {
      setEliminando(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const payload = {
        name: nuevoProveedor.name,
        providerTypeId: Number(nuevoProveedor.providerTypeId),
        status: Number(nuevoProveedor.providerStatusId),
        email: nuevoProveedor.email,
        phone: nuevoProveedor.phone,
        price: nuevoProveedor.price === "" ? 0 : Number(nuevoProveedor.price),
        supportsVegetarian: !!nuevoProveedor.supportsVegetarian,
        supportsVegan: !!nuevoProveedor.supportsVegan,
        supportsGlutenFree: !!nuevoProveedor.supportsGlutenFree,
      };

      if (modoEdicion) {
        await actualizarProveedor(idProveedorSeleccionado, payload);
      } else {
        await crearProveedor(payload);
      }

      setNuevoProveedor(estadoInicialForm);
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
      const msg = error.response?.data?.Message || error.response?.data?.message || "Hubo un error al intentar guardar los datos del proveedor.";
      alert(msg);
    } finally {
      setGuardando(false);
    }
  };

  // Buscamos el contenedor del portal (si no existe, cae en el body de respaldo)
  const modalRoot = document.getElementById("modal-root") || document.body;

  return (
    <div className="space-y-6">
      {/* Cabecera Base */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#0C447C]">
            Proveedores Contratados
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona y visualiza todos los proveedores contratados.
          </p>
        </div>

        {/* Botón de Agregar y Filtro */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600">
              Tipo de proveedor:
            </label>
            <select
              value={tipoProveedor}
              onChange={handleFiltroChange}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[#0C447C] focus:outline-none"
            >
              <option value="">Todos</option>
              {tiposProveedor.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={abrirModalCrear}
            className="bg-[#0C447C] hover:bg-[#0a3866] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Agregar Proveedor
          </button>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Contenedor de la Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Dietas Especiales</th>
                <th className="px-6 py-4">Precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {cargando ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    <span className="inline-block animate-pulse">
                      Cargando proveedores...
                    </span>
                  </td>
                </tr>
              ) : proveedores.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-slate-400 italic"
                  >
                    No se encontraron proveedores.
                  </td>
                </tr>
              ) : (
                proveedores.map((prov) => (
                  <tr
                    key={prov?.id || Math.random()}
                    onClick={() => abrirModalEditar(prov)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {prov?.name || "Sin Nombre"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">{prov?.email || "-"}</div>
                      <div className="text-xs text-slate-400">
                        {prov?.phone || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {prov?.providerTypeName || MAPA_RUBROS[prov?.type] || "No asignado"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {prov?.supportsVegetarian && (
                          <span className="px-2 py-0.5 text-[11px] bg-green-50 text-green-700 rounded border border-green-200">
                            Vegetariano
                          </span>
                        )}
                        {prov?.supportsVegan && (
                          <span className="px-2 py-0.5 text-[11px] bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                            Vegano
                          </span>
                        )}
                        {prov?.supportsGlutenFree && (
                          <span className="px-2 py-0.5 text-[11px] bg-amber-50 text-amber-700 rounded border border-amber-200">
                            Sin TACC
                          </span>
                        )}
                        {!prov?.supportsVegetarian &&
                          !prov?.supportsVegan &&
                          !prov?.supportsGlutenFree && (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-900">
                      $
                      {prov?.price != null
                        ? prov.price.toLocaleString("es-AR")
                        : "0"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación Inferior */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Mostrando página{" "}
            <span className="font-medium text-slate-700">{pagina}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
              disabled={pagina === 1 || cargando}
              className="px-3 py-1.5 text-xs font-medium rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagina((prev) => prev + 1)}
              disabled={!tieneMas || cargando}
              className="px-3 py-1.5 text-xs font-medium rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* --- PORTAL: MODAL PARA AGREGAR / MODIFICAR PROVEEDOR --- */}
      {mostrarModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">
                  {modoEdicion
                    ? "Modificar Proveedor"
                    : "Agregar Nuevo Proveedor"}
                </h3>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre del Proveedor *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={nuevoProveedor.name}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0C447C] focus:outline-none"
                    placeholder="Ej: Catering S.A."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tipo de Proveedor *
                    </label>
                    <select
                      name="providerTypeId"
                      required
                      value={nuevoProveedor.providerTypeId}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0C447C] focus:outline-none"
                    >
                      <option value="">Selecciona una opción</option>
                      {tiposProveedor.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Precio ($) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      value={nuevoProveedor.price}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0C447C] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={nuevoProveedor.email}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0C447C] focus:outline-none"
                      placeholder="correo@proveedor.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={nuevoProveedor.phone}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0C447C] focus:outline-none"
                      placeholder="+54 11 ..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Preferencias/Dietas que soporta
                  </label>
                  <div className="flex flex-wrap gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="supportsVegetarian"
                        checked={nuevoProveedor.supportsVegetarian}
                        onChange={handleInputChange}
                        className="rounded border-slate-300 text-[#0C447C] focus:ring-[#0C447C]"
                      />
                      Vegetariano
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="supportsVegan"
                        checked={nuevoProveedor.supportsVegan}
                        onChange={handleInputChange}
                        className="rounded border-slate-300 text-[#0C447C] focus:ring-[#0C447C]"
                      />
                      Vegano
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="supportsGlutenFree"
                        checked={nuevoProveedor.supportsGlutenFree}
                        onChange={handleInputChange}
                        className="rounded border-slate-300 text-[#0C447C] focus:ring-[#0C447C]"
                      />
                      Sin TACC
                    </label>
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t border-slate-100">
                  {modoEdicion ? (
                    <button
                      type="button"
                      onClick={(e) =>
                        handleIntentarEliminar(e, {
                          id: idProveedorSeleccionado,
                          name: nuevoProveedor.name,
                        })
                      }
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Eliminar Proveedor
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setMostrarModal(false)}
                      disabled={guardando}
                      className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={guardando}
                      className="px-4 py-2 text-sm font-medium bg-[#0C447C] hover:bg-[#0a3866] text-white rounded-lg disabled:opacity-50 shadow-sm"
                    >
                      {guardando
                        ? "Guardando..."
                        : modoEdicion
                          ? "Guardar Cambios"
                          : "Guardar Proveedor"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>,
          modalRoot,
        )}

      {/* --- PORTAL: MODAL DE CONFIRMACIÓN DE ELIMINACIÓN --- */}
      {mostrarConfirmarEliminar &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-red-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-slate-800">
                    ¿Confirmas la eliminación?
                  </h3>
                </div>

                <p className="text-sm text-slate-600">
                  Estás a punto de eliminar al proveedor{" "}
                  <span className="font-semibold text-slate-900">
                    "{proveedorAEliminar?.name}"
                  </span>
                  . Esta acción no se puede deshacer.
                </p>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarConfirmarEliminar(false);
                      setProveedorAEliminar(null);
                    }}
                    disabled={eliminando}
                    className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmarEliminar}
                    disabled={eliminando}
                    className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 shadow-sm"
                  >
                    {eliminando ? "Eliminando..." : "Sí, Eliminar"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          modalRoot,
        )}
    </div>
  );
}
