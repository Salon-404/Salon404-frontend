import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { TOKEN_KEY, RUTA_ADMIN, RUTA_USER } from "../../constants/auth";
import { decodeToken } from "../../globals/decodeToken";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorGeneral, setErrorGeneral] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit({ email, password }) {
    setErrorGeneral(null);
    try {
      const usuarioAutenticado = await login({ email, password });
      const rolUser = usuarioAutenticado?.role?.toUpperCase() || "USER";
      if (rolUser === "USER") {
        navigate(RUTA_USER);
      } else {
        const destino = location.state?.from?.pathname ?? RUTA_ADMIN;
        navigate(destino, { replace: true });
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        setErrorGeneral("Email o contraseña incorrectos.");
      } else {
        setErrorGeneral("Ocurrió un error. Intentá de nuevo.");
      }
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* ── Izquierda ─────────────────────────────────────────────────── */}
      <div className="bg-[#0C447C] flex flex-col justify-between px-16 py-12">
        <div className="text-[#85B7EB] font-semibold text-lg tracking-tight">
          EventosPro
        </div>

        <div className="flex flex-col gap-6">
          <span className="text-xs tracking-widest text-[#85B7EB] uppercase">
            Bienvenido de vuelta
          </span>
          <h1 className="text-4xl font-semibold text-white leading-snug">
            Organizá tu próximo{" "}
            <em className="not-italic text-[#85B7EB]">evento especial</em>
          </h1>
          <p className="text-[#B5D4F4] text-base leading-relaxed max-w-sm">
            Accedé a tu cuenta para gestionar reservas, horarios y salones en
            tiempo real.
          </p>

          {/* Tarjetas decorativas */}
          <div className="flex flex-col gap-3 mt-4 max-w-xs">
            <div className="bg-white/10 rounded-xl px-5 py-4 flex items-center gap-4 backdrop-blur-sm">
              <span className="text-2xl"></span>
              <div>
                <div className="text-sm font-semibold text-white">
                  Disponibilidad en tiempo real
                </div>
                <div className="text-xs text-[#85B7EB]">
                  Consultá horarios al instante
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl px-5 py-4 flex items-center gap-4 backdrop-blur-sm">
              <span className="text-2xl"></span>
              <div>
                <div className="text-sm font-semibold text-white">
                  Reserva confirmada al instante
                </div>
                <div className="text-xs text-[#85B7EB]">
                  Sin esperas ni llamadas
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-[#378ADD]">
          © 2026 EventosPro · Todos los derechos reservados
        </div>
      </div>

      {/* ── Derecha: formulario ───────────────────────────────────────── */}
      <div className="bg-[#E6F1FB] flex items-center justify-center px-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0C447C] mb-1">
              Iniciá sesión
            </h2>
            <p className="text-sm text-slate-500">
              Ingresá tus credenciales para continuar
            </p>
          </div>

          {errorGeneral && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorGeneral}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-5"
          >
            <div>
              <label className="block text-sm font-medium text-[#0C447C] mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                className="w-full rounded-lg border border-[#B5D4F4] bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-[#185FA5] focus:outline-none focus:ring-1 focus:ring-[#185FA5] placeholder-slate-400"
                {...register("email", {
                  required: "El email es obligatorio",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Ingresá un email válido",
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0C447C] mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#B5D4F4] bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-[#185FA5] focus:outline-none focus:ring-1 focus:ring-[#185FA5] placeholder-slate-400"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                })}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#185FA5] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0C447C] disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm mt-2"
            >
              {isSubmitting ? "Ingresando…" : "Ingresar →"}
            </button>
            <p className="text-center text-sm text-slate-500 mt-2">
              ¿No tenés cuenta?{" "}
              <Link
                to="/register"
                className="text-[#185FA5] font-medium hover:underline"
              >
                Registrate
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
