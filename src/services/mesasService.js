import axios from "axios";
import { services } from "./endpointsUrl";
import { TOKEN_KEY } from "../constants/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_MESAS_URL || services.mesas,
});

function authHeader() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getTablesByEventId(eventId) {
  const { data } = await api.get(`${eventId}/Tables`, {
    headers: authHeader(),
  });
  return data;
}

export async function updateTableLayout(eventId, tableId, payload) {
  const { data } = await api.patch(
    `${eventId}/Tables/${tableId}/layout`,
    payload,
    { headers: authHeader() },
  );
  return data;
}

export async function createTable(eventId, payload) {
  const { data } = await api.post(`${eventId}/Tables`, payload, {
    headers: authHeader(),
  });
  return data;
}

// Devuelve el layout global del salon con todas las mesas y sus posiciones
export async function getLayout() {
  const { data } = await api.get("/api/mesas/layout", {
    headers: authHeader(),
  });
  return data;
}

// Guarda el layout completo del salon (reemplaza todo)
export async function putLayout(layout) {
  const { data } = await api.put("/api/mesas/layout", layout, {
    headers: authHeader(),
  });
  return data;
}

// Elimina una mesa del plano. Devuelve 409 si tiene invitados asignados en reservas activas.
export async function deleteMesa(mesaId) {
  await api.delete(`/api/mesas/${mesaId}`, { headers: authHeader() });
}

// Devuelve el estado de asignaciones de invitados para una reserva especifica
export async function getAsignaciones(reservaId) {
  const { data } = await api.get(`/api/mesas/asignaciones/${reservaId}`, {
    headers: authHeader(),
  });
  return data;
}

// Asigna un invitado a una mesa. Devuelve 409 con CAPACIDAD_EXCEDIDA si esta llena.
export async function createAsignacion({ reservaId, mesaId, invitadoId }) {
  const { data } = await api.post(
    "/api/mesas/asignaciones",
    {
      reservaId,
      mesaId,
      invitadoId,
    },
    { headers: authHeader() },
  );
  return data;
}

// Quita la asignacion de un invitado a una mesa
export async function deleteAsignacion(asignacionId) {
  await api.delete(`/api/mesas/asignaciones/${asignacionId}`, {
    headers: authHeader(),
  });
}

// Devuelve el layout con la ocupacion por mesa para la vista de solo lectura del cliente
export async function getPlano(reservaId) {
  const { data } = await api.get(`/api/mesas/plano/${reservaId}`, {
    headers: authHeader(),
  });
  return data;
}
