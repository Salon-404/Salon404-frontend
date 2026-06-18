import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { successToast, errorToast } from '../../globals/toast'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/global/Navbar'

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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
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
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (error) {
      errorToast('Error al registrarse', error.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-center text-3xl font-bold text-slate-800">
            Salon 404
          </h1>

          <p className="mb-6 text-center text-sm text-slate-500">
            Creá tu cuenta para comenzar
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                placeholder="Juan"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Apellido
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Pérez"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="juan@email.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Teléfono
              </label>
              <input
                type="text"
                name="phone"
                placeholder="+54 11 2090 9888"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                placeholder="********"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Confirmar contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="********"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Registrarse
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Ya tengo cuenta
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
