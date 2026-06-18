import {  createContext,  useContext,  useState,  useEffect,  useCallback,} from "react";
import {  login as loginService,  register as registerService,} from "../services/authService";
import { TOKEN_KEY } from "../constants/auth";
import { decodeToken } from "../globals/decodeToken";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar la sesión al refrescar la página
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const payload = decodeToken(token);

      const usuario = {
        id: payload.id,
        name: payload.name,
        role: payload.role,
        email: payload.email,
      };

      setUser(usuario);
    } catch (err) {
      console.error("Error al decodificar el token:", err);
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await loginService({ email, password });

    const token = res?.Token || res?.token;

    if (!token) {
      throw new Error("No se recibió el token del servidor");
    }

    localStorage.setItem(TOKEN_KEY, token);

    const payload = decodeToken(token);

    const usuario = {
      id: payload.id,
      name: payload.name,
      role: payload.role,
      email: payload.email,
    };

    setUser(usuario);

    return usuario;
  }, []);

  const register = useCallback(
    async ({ name, lastName, email, password, phone }) => {
      const response = await registerService({
        name,
        lastName,
        email,
        password,
        phone,
      });

      return response;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return ctx;
}