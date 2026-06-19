import axios from 'axios'
import { services } from './endpointsUrl'

const urlBase = services.proveedores

export const obtenerProveedores = (pagina = 1, porPagina = 100) =>
  axios.get(urlBase, { params: { page: pagina, pageSize: porPagina } })

export const obtenerProveedorPorId = (id) =>
  axios.get(`${urlBase}/${id}`)

export const crearProveedor = (datos) =>
  axios.post(urlBase, datos)

export const actualizarProveedor = (id, datos) =>
  axios.put(`${urlBase}/${id}`, datos)

export const eliminarProveedor = (id) =>
  axios.delete(`${urlBase}/${id}`)

export const obtenerSugerenciasCatering = (nivel = null) => {
  const parametros = nivel ? { nivel } : {}
  return axios.get(`${urlBase}/catering/sugerencias`, { params: parametros })
}