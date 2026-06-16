import axios from 'axios'
import { usuariosMock } from '../mocks/authMock'
import { TOKEN_KEY } from '../constants/auth'
import { services } from './endpointsUrl';
import { decodeToken } from '../globals/decodeToken';
// Poner en false cuando el backend de Juan Cruz (Dupla 1) esté listo
const USE_MOCK = false

function delay(ms = 250) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function generarTokenMock(usuario) {
  return `mock_token_${usuario.id}_${Date.now()}`
}

export async function login({email,password}) {
  if (USE_MOCK) {
    await delay()
    const usuario = usuariosMock.find(u => u.email === email && u.password === password)
    if (!usuario) {
      const error = new Error('Email o contraseña incorrectos')
      error.response = { status: 401 }
      throw error
    }
    const token = generarTokenMock(usuario)
    const { password: _, ...usuarioSinPassword } = usuario
    return { token, user: { ...usuarioSinPassword, role: usuario.rol } }
  }
  
  try
  {
    const response = await axios.post( `${services.auth}login`,{email,password});
    const tokenStr = response.data.token || response.data; // Extraer el token del objeto devuelto
    const userData = decodeToken(tokenStr);
    return { token: tokenStr, user: userData };
  }
  catch(error)
  {
     throw new Error(error.response?.data?.details || error.response?.data?.message || error.message || "No se pudo conectar con el servidor");
  }
}

export async function register({name,lastName,email,password,phone})
{
  try
  {
    const response = await axios.post(`${services.auth}register`,{name,lastName,email,password,phone});
    return response.data;

  }
  catch(error)
  {
    throw new Error(error.response?.data?.details || error.response?.data?.message || error.message || "No se pudo conectar con el servidor");
  }

}


export async function logout() {
  await api.post('/api/auth/logout', null, {
    headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` },
  })
}

export async function getMe(token) {
  if (USE_MOCK) {
    await delay()
    const partes = token?.split('_')
    const id = partes ? parseInt(partes[2]) : null
    const usuario = usuariosMock.find(u => u.id === id)
    if (!usuario) {
      const error = new Error('Token inválido')
      error.response = { status: 401 }
      throw error
    }
    const { password: _, ...usuarioSinPassword } = usuario
    return usuarioSinPassword
  }
  const { data } = await api.get('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}
