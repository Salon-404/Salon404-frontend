import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center px-6 py-4">
        <div className="w-1/3">
          <Link
            to="/"
            className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            EventosPro
          </Link>
        </div>

        <div className="flex w-1/3 justify-center items-center gap-8">
          <Link
            to="/"
            className="font-medium text-slate-600 transition-colors hover:text-indigo-600"
          >
            Inicio
          </Link>

          <Link
            to="/disponibilidad"
            className="font-medium text-slate-600 transition-colors hover:text-indigo-600"
          >
            Disponibilidad
          </Link>

          <Link
            to="/eventos"
            className="font-medium text-slate-600 transition-colors hover:text-indigo-600"
          >
            Eventos
          </Link>

          <Link
            to="/salones"
            className="font-medium text-slate-600 transition-colors hover:text-indigo-600"
          >
            Salones
          </Link>

          {user && (user.role === "SuperAdmin" || user.rol === "SuperAdmin") && (
            <Link
              to="/dashboard"
              className="font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
            >
              Panel Admin
            </Link>
          )}
        </div>

        <div className="flex w-1/3 justify-end items-center gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Ingresar
              </Link>

              <Link
                to="/register"
                className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Registrarse
              </Link>
            </>
          ) : (
            <>
              <span className="font-medium text-slate-700">
                Hola, {user.name || user.nombre || user.email}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-md bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
