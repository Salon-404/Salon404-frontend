import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as loginService, logout as logoutService, getMe,register as registerService } from '../services/authService'
import { TOKEN_KEY } from '../constants/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
/*
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    getMe(token)
      .then(userData => setUser(userData))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])
*/
  const login = useCallback(async ({ email, password }) => {
    const { token, user: userData } = await loginService({ email, password })
    localStorage.setItem(TOKEN_KEY, token)
    setUser(userData)
    return userData;
  }, [])

//Use callback sirve para que react no vuelva a crear una funcion cada vez que renderice la pag
//que usa este componente. Es como un addscoped de .net
  const register = useCallback(async ({name,lastName,email,password,phone})=>
    {
      const response = await registerService({name,lastName,email,password,phone})
      return response;
    },[]);
    //El [] del final indica que no depende de ningun parametro para cambiar.


  const logout = useCallback(async () => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login,register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
