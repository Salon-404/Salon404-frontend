import axios from "axios";
import { services } from "./endpointsUrl";
const api = axios.create({
  baseURL: services.eventos,
})

export async function getAllEventSchedule(eventId) {
  try {
    const { data } = await axios.get(`${services.eventSchedule}/${eventId}/eventSchedule`)
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.details || 'No se pudo conectar con el servidor')
  }
}

export async function CreateEventSchedule(payload) {
  try {
    const { data } = await axios.post(`${services.eventSchedule}`,
      {
        eventId:payload.id,
        title:payload.title,
        description:payload.description,
        startTime:payload.startTime,
        endTime:payload.endTime
      },{
    headers: {
      'Content-Type': 'application/json'
    }})
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.details || 'No se pudo conectar con el servidor')
  }
}