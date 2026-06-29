import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { invitadosService } from "../../services/invitadosService";
import Swal from "sweetalert2";

export function InvitacionForm() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [isConfirmado, setIsConfirmado] = useState(false);

  const [ticket, setTicket] = useState(null);
  const [resolvedIds, setResolvedIds] = useState({ eventId: null, guestId: null });
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    dietTypeId: 1,
  });

  useEffect(() => {
    const verificarInvitadoYTicket = async () => {
      try {
        setLoading(true);

        // LÓGICA CORRECTA: 1. Primero verificamos el estado del invitado en el sistema usando el token
        const datosInvitado = await invitadosService.getByToken(token);

        if (datosInvitado) {
          // Guardamos los IDs reales resueltos por el backend para utilizarlos después en la generación de tickets
          const evId = datosInvitado.eventId || datosInvitado.EventId;
          const gstId = datosInvitado.id || datosInvitado.Id;
          setResolvedIds({ eventId: evId, guestId: gstId });

          // Guardamos sus datos actuales en el estado del formulario
          setFormData({
            fullName: datosInvitado.fullName || datosInvitado.FullName || "",
            phone: datosInvitado.phone || datosInvitado.Phone || "",
            email: datosInvitado.email || datosInvitado.Email || "",
            dietTypeId:
              datosInvitado.dietTypeId || datosInvitado.DietTypeId || 1,
          });

          const statusId =
            datosInvitado.guestStatusId || datosInvitado.GuestStatusId;

          // 2. Si el backend nos dice que YA está confirmado (Status == 2), buscamos su Ticket directo
          if (statusId === 2) {
            try {
              const ticketExistente = await invitadosService.getTicket(
                evId,
                gstId,
              );
              if (ticketExistente && ticketExistente.qrCodeToken) {
                setTicket(ticketExistente);
                setIsConfirmado(true);
              }
            } catch (errTicket) {
              console.log(
                "Está confirmado pero no tiene ticket creado aún. Se generará ahora mismo...",
              );
              // En caso de que esté confirmado pero falte el ticket por algún motivo, lo creamos en caliente
              const nuevoTicket = await invitadosService.generarTicket(
                evId,
                gstId,
              );
              setTicket(nuevoTicket);
              setIsConfirmado(true);
            }
          } else {
            // Si el estado es Pendiente, forzamos a que vea el formulario para confirmar primero
            setIsConfirmado(false);
          }
        }
      } catch (error) {
        console.error("Error al obtener el estado del invitado:", error);
        setIsConfirmado(false);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verificarInvitadoYTicket();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "dietTypeId" ? parseInt(value) : value,
    }));
  };

  const handleConfirmarAsistencia = async (e) => {
    e.preventDefault();
    try {
      setProcesando(true);

      // PASO 1: Primero realizamos el PUT por token para pasar el invitado a estado Confirmado (guestStatusId: 2)
      await invitadosService.updateByToken(token, {
        fullName: formData.fullName,
        phone: formData.phone || "",
        email: formData.email || "",
        dietTypeId: formData.dietTypeId,
        guestStatusId: 2, // <--- CAMBIO DE ESTADO REQUERIDO POR EL BACKEND
      });

      // PASO 2: Ahora que el invitado ya está confirmado en la BD, la generación del ticket no va a fallar
      const nuevoTicket = await invitadosService.generarTicket(
        resolvedIds.eventId,
        resolvedIds.guestId,
      );

      if (nuevoTicket && nuevoTicket.qrCodeToken) {
        setTicket(nuevoTicket);
        setIsConfirmado(true);

        Swal.fire({
          title: "¡Asistencia Confirmada!",
          text: "Tu pase de acceso exclusivo ha sido generado con éxito.",
          icon: "success",
          confirmButtonColor: "#0C447C",
        });
      }
    } catch (err) {
      console.error("Error en el flujo de confirmación:", err);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al procesar tu confirmación. Por favor, vuelve a intentarlo.",
        icon: "error",
        confirmButtonColor: "#0C447C",
      });
    } finally {
      setProcesando(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#185FA5] border-t-transparent mb-4"></div>
        <p className="text-slate-600 font-medium text-sm">
          Cargando tu invitación...
        </p>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0C447C]/10 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#0C447C] text-white p-6 text-center space-y-1">
          <h2 className="text-xl font-bold tracking-wide">
            {isConfirmado ? "¡Tu Pase de Acceso!" : "Confirmar Asistencia"}
          </h2>
          <p className="text-slate-200 text-xs uppercase tracking-wider font-medium">
            {isConfirmado
              ? "Presentá el código QR en la entrada"
              : "Actualizá tus datos para el ingreso"}
          </p>
        </div>

        {/* CONTENIDO INTERCAMBIABLE */}
        {isConfirmado ? (
          /* VISTA A: TICKET EXISTENTE */
          <div className="p-6 text-center space-y-6">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                Invitado
              </p>
              <h3 className="text-lg font-bold text-slate-800">
                {ticket?.guestName ||
                  formData.fullName ||
                  "Invitado Confirmado"}
              </h3>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 inline-block mx-auto shadow-inner">
              {ticket?.qrCodeToken ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.qrCodeToken)}`}
                  alt="Código QR"
                  className="w-44 h-44 mx-auto block bg-white p-2 rounded-lg"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center bg-slate-200 rounded-lg text-slate-400 text-xs p-4">
                  Generando QR...
                </div>
              )}
            </div>
          </div>
        ) : (
          /* VISTA B: FORMULARIO DE CONFIRMACIÓN */
          <form onSubmit={handleConfirmarAsistencia} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Nombre Completo (Fijado)
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                readOnly
                className="w-full px-3 py-2.5 border rounded-xl text-sm bg-slate-100 text-slate-500 font-medium cursor-not-allowed outline-none select-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ej: 1123456789"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-[#185FA5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-[#185FA5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Tipo de Dieta
              </label>
              <select
                name="dietTypeId"
                value={formData.dietTypeId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:border-[#185FA5]"
              >
                <option value="1">Estándar</option>
                <option value="2">Vegetariano</option>
                <option value="3">Vegano</option>
                <option value="4">Celíaco</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={procesando}
              className="w-full bg-[#0C447C] hover:bg-[#185FA5] text-white text-sm font-medium py-3 rounded-xl transition-all shadow-md mt-6"
            >
              {procesando
                ? "Confirmando asistencia..."
                : "Confirmar Invitación ✨"}
            </button>
          </form>
        )}

        <div className="bg-slate-50 py-3 px-6 border-t border-slate-100 text-center text-slate-400 text-[10px]">
          Pase de acceso personal e intransferible.
        </div>
      </div>
    </div>
  );
}
