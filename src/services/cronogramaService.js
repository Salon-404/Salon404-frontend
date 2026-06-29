import axios from "axios"
import { services } from "./endpointsUrl"

const urlBase = services.eventSchedule

export const obtenerCronograma = (eventoId) =>
  axios.get(`${urlBase}/${eventoId}`)

export const agregarActividad = (eventoId, data) =>
  axios.post(`${urlBase}/${eventoId}`, data)

export const actualizarActividad = (id, data) =>
  axios.put(`${urlBase}/${id}`, data)

export const eliminarActividad = (id) =>
  axios.delete(`${urlBase}/${id}`)