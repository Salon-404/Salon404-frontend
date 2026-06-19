import axios from "axios";
import { services } from "./endpointsUrl";
const api = axios.create({
  baseURL: services.eventos,
})

function getScheduleErrorMessage(error, fallback) {
  const data = error.response?.data;

  if (typeof data === "string" && data.trim()) return data;
  if (data?.details || data?.Details) return data.details ?? data.Details;
  if (data?.message || data?.Message) return data.message ?? data.Message;

  if (data?.errors && typeof data.errors === "object") {
    const validationMessages = Object.values(data.errors).flat().filter(Boolean);
    if (validationMessages.length > 0) return validationMessages.join(" ");
  }

  if (error.code === "ERR_NETWORK") {
    return "No se pudo conectar con el servidor";
  }

  return fallback;
}

export async function getAllEventSchedule(eventId) {
  try {
    const { data } = await axios.get(`${services.eventSchedule}/${eventId}/eventSchedule`)
    return data;
  } catch (error) {
    throw new Error(getScheduleErrorMessage(error, "No se pudo cargar el cronograma"))
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
    throw new Error(getScheduleErrorMessage(error, "No se pudo crear la actividad"))
  }
}

export async function updateEventSchedule(payload) {
  try {
    await axios.patch(`${services.eventSchedule}/UpdateEventShedule`, {
      id: payload.id,
      title: payload.title,
      description: payload.description,
      startTime: payload.startTime,
      endTime: payload.endTime,
    });
  } catch (error) {
    throw new Error(getScheduleErrorMessage(error, "No se pudo actualizar la actividad"));
  }
}

export async function deleteEventSchedule(eventId, eventScheduleId) {
  try {
    await axios.delete(`${services.eventSchedule}/DeleteEventSchedule`, {
      data: { eventId, eventScheduleId },
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    throw new Error(getScheduleErrorMessage(error, "No se pudo eliminar la actividad"));
  }
}
