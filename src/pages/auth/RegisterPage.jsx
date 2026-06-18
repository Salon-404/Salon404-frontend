import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { successToast, errorToast } from '../../globals/toast'
import { useAuth } from '../../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      errorToast('Las contraseñas no coinciden', 'Verificá ambas contraseñas')
      return
    }
    try {
      await register(form)
      successToast('Registro realizado con éxito', 'Ya podés iniciar sesión')
      setTimeout(() => navigate('/login'), 1500)
    } catch (error) {
      errorToast('Error al registrarse', error.message)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-[#B5D4F4] bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-[#185FA5] focus:outline-none focus:ring-1 focus:ring-[#185FA5] placeholder-slate-400'
  const labelClass = 'block text-sm font-medium text-[#0C447C] mb-1.5'

  return (
    <div className="min-h-screen grid grid-cols-2">

      {/* ── Izquierda ─────────────────────────────────────────────────── */}
      <div className="bg-[#0C447C] flex flex-col justify-between px-16 py-12">
        <div className="text-[#85B7EB] font-semibold text-lg tracking-tight">
          EventosPro
        </div>

        <div className="flex flex-col gap-6">
          <span className="text-xs tracking-widest text-[#85B7EB] uppercase">
            Comenzá hoy
          </span>
          <h1 className="text-4xl font-semibold text-white leading-snug">
            Creá tu cuenta y{" "}
            <em className="not-italic text-[#85B7EB]">reservá tu fecha</em>
          </h1>
          <p className="text-[#B5D4F4] text-base leading-relaxed max-w-sm">
            Registrate gratis y accedé a disponibilidad en tiempo real, sin turnos ni llamadas.
          </p>

          <div className="flex flex-col gap-3 mt-4 max-w-xs">
            <div className="bg-white/10 rounded-xl px-5 py-4 flex items-center gap-4">
              <span className="text-2xl"></span>
              <div>
                <div className="text-sm font-semibold text-white">+500 eventos organizados</div>
                <div className="text-xs text-[#85B7EB]">Clientes que ya confían en nosotros</div>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl px-5 py-4 flex items-center gap-4">
              <span className="text-2xl"></span>
              <div>
                <div className="text-sm font-semibold text-white">Registro seguro</div>
                <div className="text-xs text-[#85B7EB]">Tus datos siempre protegidos</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-[#378ADD]">
          © 2026 EventosPro · Todos los derechos reservados
        </div>
      </div>

      {/* ── Derecha: formulario ───────────────────────────────────────── */}
      <div className="bg-[#E6F1FB] flex items-center justify-center px-12 py-12">
        <div className="w-full max-w-sm">

          <div className="mb-7">
            <h2 className="text-2xl font-semibold text-[#0C447C] mb-1">
              Crear cuenta
            </h2>
            <p className="text-sm text-slate-500">
              Completá tus datos para registrarte
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Nombre</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Juan"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Apellido</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Pérez"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="juan@email.com"
                value={form.email}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Teléfono</label>
              <input
                type="text"
                name="phone"
                placeholder="+54 11 2090 9888"
                value={form.phone}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Contraseña</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Confirmar</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#185FA5] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0C447C] transition-colors shadow-sm mt-1"
            >
              Crear cuenta →
            </button>

            <p className="text-center text-sm text-slate-500">
              ¿Ya tenés cuenta?{" "}
              <Link to="/login" className="text-[#185FA5] font-medium hover:underline">
                Iniciá sesión
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  )
}