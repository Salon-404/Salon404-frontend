import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { successToast,errorToast } from "../../globals/toast";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext"; //Contexto de auth. Nos deja usar login,register,etc
export default function RegisterPage()
{
    const navigate = useNavigate(); //Registro el uso de navigate. Sirve para rederigirme entre pags
    const {register} = useAuth();//Registro el uso del contexto de auth.
    const [form,setForm] = useState( //Formulario para los datos de registro.
        {
            name:'',
            lastName:'',
            email:'',
            phone:'',
            password:'',
            confirmPassword:''
            
        });
    const [error,setError] = useState(""); //Manejo de errores

    const handleChange = (e) => //Esto lo que hace es que detecta cuando un campo cambia y setea el nuevo valor.
        {
            setForm //el ...form copia los valores que ya tenemos
            ({
                ...form,[e.target.name]:e.target.value,
            });
        }
    
    const handleSubmit = async (e)=> //Comportamiento para cuando submitee el form el usuario
        {
            e.preventDefault();
 
       if(form.password !== form.confirmPassword)
        {
           errorToast("Las contraseñas no coinciden","Verificá ambas contraseñas")
            return;
        }    
            try
            {
             await register(form); //le pego al register que tengo en el authcontext. 
             successToast("Registro realizado con éxito","Ya podes iniciar sesión");
            setTimeout(()=>
                {
                navigate("/login");
                },1500);
            }
            catch(error)
            {
            errorToast("Error al registrarse",error.message);
            }
             
        }



  return (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-center text-3xl font-bold text-slate-800">
        Salon 404
      </h1>

      <p className="mb-6 text-center text-sm text-slate-500">
        Creá tu cuenta para comenzar
      </p>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
            Telefono
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
          onClick={() => navigate("/login")}
          className="w-full rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          Ya tengo cuenta
        </button>
      </form>
    </div>
  </div>
); // Devuelvo el html de la página


}