import axios from 'axios'
import { usuariosMock } from '../mocks/authMock'
import { TOKEN_KEY } from '../constants/auth'

// Poner en false cuando el backend de Juan Cruz (Dupla 1) esté listo
const USE_MOCK = true

const api = axios.create({
  baseURL: import.meta.env.VITE_API_AUTH_URL,
})

function delay(ms = 250) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function generarTokenMock(usuario) {
  return `mock_token_${usuario.id}_${Date.now()}`
}

export async function login({ email, password }) {
  if (USE_MOCK) {
    await delay()
    const usuario = usuariosMock.find(
      u => u.email === email && u.password === password
    )
    if (!usuario) {
      const error = new Error('Credenciales incorrectas')
      error.response = { status: 401 }
      throw error
    }
    const { password: _, ...usuarioSinPassword } = usuario
    const token = generarTokenMock(usuarioSinPassword)
    return { token, user: usuarioSinPassword }
  }
  const { data } = await api.post('/api/auth/login', { email, password })
  return data
}

export async function logout() {
  if (USE_MOCK) {
    await delay(100)
    return null
  }
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
