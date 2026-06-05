import { useState } from 'react'
import { useNavigate, useLocation, replace } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { TOKEN_KEY,RUTA_ADMIN,RUTA_USER } from '../../constants/auth'
import { decodeToken } from '../../globals/decodeToken'

const INPUT_CLASS =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 shadow-sm ' +
  'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
const LABEL_CLASS = 'block text-sm font-medium text-slate-700 mb-1'
const ERROR_CLASS = 'mt-1 text-xs text-red-600'

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()

  const [errorGeneral, setErrorGeneral] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  async function onSubmit({ email, password }) {
    setErrorGeneral(null)
    try {
      await login( {email, password} )
      const token = localStorage.getItem(TOKEN_KEY);
      const payload = decodeToken(token);
      if(payload.role=="Admin")
      {
          navigate(RUTA_ADMIN, { replace: true })
      }
      else
        {
          navigate(RUTA_USER,{replace:true})
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold text-slate-800">Salon 404</h1>

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
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white
                      hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
            {isSubmitting ? 'Ingresando…' : 'Ingresar'}
            </button>

            <button
            type="button"
            onClick={() => navigate('/register')}
            className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700
                      hover:bg-slate-100 transition-colors"
            >
            Registrarse
            </button>
          
        </form>
      </div>
    </div>
  )
}
