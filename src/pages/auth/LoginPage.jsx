import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { ROLES, RUTA_DEFAULT, RUTA_USER } from '../../constants/auth'
import Navbar from '../../components/global/Navbar'

const INPUT_CLASS =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 shadow-sm ' +
  'focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500'
const LABEL_CLASS = 'block text-sm font-medium text-slate-700 mb-1'
const ERROR_CLASS = 'mt-1 text-xs text-red-600'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [errorGeneral, setErrorGeneral] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  async function onSubmit({ email, password }) {
    setErrorGeneral(null)
    try {
      const usuarioAutenticado = await login({ email, password })
      const rolUser = usuarioAutenticado?.rol

      if (rolUser === ROLES.USER) {
        navigate(RUTA_USER)
      } else {
        const destino = location.state?.from?.pathname ?? RUTA_DEFAULT
        navigate(destino, { replace: true })
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        setErrorGeneral('Email o contraseña incorrectos.')
      } else {
        setErrorGeneral('Ocurrió un error. Intentá de nuevo.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-center text-2xl font-bold tracking-tight text-slate-900">
            Salon 404
          </h1>
          <p className="mb-6 text-center text-sm text-slate-500">
            Ingresá con tu cuenta
          </p>

          {errorGeneral && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorGeneral}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label className={LABEL_CLASS}>Email</label>
              <input
                type="email"
                placeholder="admin@salon404.com"
                className={INPUT_CLASS}
                {...register('email', {
                  required: 'El email es obligatorio',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Ingresá un email válido',
                  },
                })}
              />
              {errors.email && <p className={ERROR_CLASS}>{errors.email.message}</p>}
            </div>

            <div>
              <label className={LABEL_CLASS}>Contraseña</label>
              <input
                type="password"
                className={INPUT_CLASS}
                {...register('password', { required: 'La contraseña es obligatoria' })}
              />
              {errors.password && <p className={ERROR_CLASS}>{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-amber-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-5 text-center">
            <p className="text-sm text-slate-600">¿No tenés cuenta?</p>
            <Link
              to="/register"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
