import axios from 'axios'
import { services } from './endpointsUrl';
// Poner en false cuando el backend de Juan Cruz (Dupla 1) esté listo


function delay(ms = 250) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function generarTokenMock(usuario) {
  return `mock_token_${usuario.id}_${Date.now()}`
}
import { services } from './endpointsUrl'

export async function login({ email, password }) {
  try {
    const response = await axios.post(`${services.auth}login`, { email, password });
    return response.data;
  }
  catch (error) {
    throw new Error(error.response.data.details || "No se pudo conectar con el servidor");
    export async function login({ email, password }) {
      try {
        const response = await axios.post(`${services.auth}login`, { email, password })
        return response.data
      } catch (error) {
        throw new Error(error.response?.data?.details || 'No se pudo conectar con el servidor')
      }
    }

    export async function register({ name, lastName, email, password, phone }) {
      try {
        const response = await axios.post(`${services.auth}register`, { name, lastName, email, password, phone });
        return response.data;
      }
      catch (error) {
        throw new Error(error.response.data.details || "No se pudo conectar con el servidor");
        export async function register({ name, lastName, email, password, phone }) {
          try {
            const response = await axios.post(`${services.auth}register`, {
              name,
              lastName,
              email,
              password,
              phone,
            })
            return response.data
          } catch (error) {
            throw new Error(error.response?.data?.details || 'No se pudo conectar con el servidor')
          }
        }

        export async function logout() {
          // El cierre de sesion se maneja localmente en el frontend borrando el token de localStorage.
        }

        export async function getMe(token) {
          const response = await axios.get(`${services.auth}me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          return response.data
        }
      }
    }
  }
}
