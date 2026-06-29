import { useParams } from "react-router-dom"
import { invitadosService } from "../../services/invitadosService";
import { useEffect, useState } from "react";
import { successToast } from "../../globals/toast";


export default function CheckIn()
{
const {eventId,qrToken} = useParams();
const [ticketData,setTicketData] = useState(null);
const [error, setError] = useState(null);
const [loading, setLoading] = useState(true);


useEffect(()=>
    {
        const loadTicketData = async () =>
            {
                try{
                  const ticketData = await  invitadosService.getByTicket(eventId,qrToken);
                  setTicketData(ticketData);
                }
                catch(err)
                {
                console.error(err);
                setError("No se pudieron cargar los datos");
                }
                finally
                {
                    setLoading(false);
                }
            };
        loadTicketData();
    },[eventId,qrToken]);

  const handleConfirmQr = async () => {
    try {
    await invitadosService.updateTicketStatus(eventId, qrToken);
    const updatedTicket = await invitadosService.getByTicket(eventId, qrToken);
    setTicketData(updatedTicket);
    successToast("Ingreso registrado con éxito");
    } catch (err) {
      console.error(err);
      setError("No se pudo confirmar la entrada");
    }
  };



    if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Cargando entrada...
    </div>
  );
}

if (error) {
  return (
    <div className="min-h-screen flex items-center justify-center text-red-600">
      {error}
    </div>
  );
}

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center p-6">

    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">

      {/* HEADER */}
      <div
        className={`relative p-10 text-center text-white ${
          ticketData.isScanned
            ? "bg-gradient-to-r from-red-600 to-red-500"
            : "bg-gradient-to-r from-[#0C447C] via-[#185FA5] to-[#2B7CD3]"
        }`}
      >
        <p className="uppercase tracking-[5px] text-sm text-white/80">
          Control de ingreso
        </p>

        <h1 className="text-4xl font-bold mt-3 text-white/80">
          {ticketData.eventName}
        </h1>

        <p className="mt-2 text-lg text-white/90">
          {new Date(ticketData.eventDate).toLocaleDateString()}
        </p>

        <div
          className={`inline-flex items-center mt-8 px-6 py-3 rounded-full text-lg font-bold shadow-lg ${
            ticketData.isScanned
              ? "bg-red-800"
              : "bg-green-600"
          }`}
        >
          {ticketData.isScanned
            ? " Entrada utilizada"
            : " Entrada válida"}
        </div>
      </div>

      {/* BODY */}
      <div className="p-10">

        {/* Invitado */}
        <div className="bg-slate-50 rounded-2xl p-6 shadow-sm">

          <h2 className="text-sm uppercase tracking-widest text-slate-500">
            Invitado
          </h2>

          <p className="text-3xl font-bold mt-2">
            {ticketData.guestName}
          </p>

          <div className="mt-6 grid md:grid-cols-2 gap-5">

            <div className="bg-white rounded-xl p-4 border">
              <p className="text-sm text-slate-500">
                Mesa asignada
              </p>

              <p className="text-xl font-semibold mt-1">
                {ticketData.tableName}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border">
              <p className="text-sm text-slate-500">
                Fecha del evento
              </p>

              <p className="text-xl font-semibold mt-1">
                {new Date(ticketData.eventDate).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border md:col-span-2">
              <p className="text-sm text-slate-500">
                Ticket
              </p>

              <p className="font-mono text-sm break-all mt-1">
                {ticketData.qrCodeToken}
              </p>
            </div>

          </div>
        </div>

        {/* Información del escaneo */}
        <div className="mt-8">

          {!ticketData.isScanned ? (

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">

              <h3 className="text-green-700 font-bold text-xl">
                El invitado todavía no ingresó
              </h3>

              <p className="text-green-700 mt-2">
                Presioná el botón para registrar el ingreso.
              </p>

              <button
                className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold text-lg shadow-lg hover:scale-[1.02] transition"
                onClick={handleConfirmQr}
              >
                Registrar ingreso
              </button>

            </div>

          ) : (

            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">

              <h3 className="text-red-700 font-bold text-xl">
                Esta entrada ya fue utilizada
              </h3>

              <p className="mt-3 text-red-700">
                El ingreso fue registrado el:
              </p>

              <p className="font-semibold mt-2 text-lg">
                {new Date(ticketData.scannedAt).toLocaleString()}
              </p>

            </div>

          )}

        </div>

      </div>

    </div>

  </div>
);


}