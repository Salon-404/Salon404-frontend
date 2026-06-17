import axios from 'axios'
import { services } from './endpointsUrl'

// URL base del microservicio de proveedores
const urlBase = services.proveedores

/**
 * Obtener lista paginada de proveedores
 * @param {number} pagina - Número de página
 * @param {number} porPagina - Cantidad por página
 */
export const obtenerProveedores = (pagina = 1, porPagina = 100) =>
  axios.get(urlBase, { params: { page: pagina, pageSize: porPagina } })

/**
 * Obtener un proveedor por su ID
 * @param {number} id - ID del proveedor
 */
export const obtenerProveedorPorId = (id) =>
  axios.get(`${urlBase}/${id}`)

/**
 * Crear un nuevo proveedor
 * @param {object} datos - Datos del proveedor
 */
export const crearProveedor = (datos) =>
  axios.post(urlBase, datos)

/**
 * Actualizar un proveedor existente
 * @param {number} id - ID del proveedor
 * @param {object} datos - Datos actualizados
 */
export const actualizarProveedor = (id, datos) =>
  axios.put(`${urlBase}/${id}`, datos)

/**
 * Eliminar un proveedor
 * @param {number} id - ID del proveedor
 */
export const eliminarProveedor = (id) =>
  axios.delete(`${urlBase}/${id}`)

/**
 * Obtener sugerencias de catering por nivel
 * @param {string|null} nivel - "bajo", "medio", "alto" o null para todas
 */
export const obtenerSugerenciasCatering = (nivel = null) => {
  const parametros = nivel ? { nivel } : {}
  return axios.get(`${urlBase}/catering/sugerencias`, { params: parametros })
}
