import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { invitadosService } from "../../services/invitadosService";
import { getEvento } from "../../services/eventosService";

export default function GuestPage() {
  const [evento, setEvent] = useState(null);
  const { invitationToken } = useParams();

  const [guest, setGuest] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const guestData = await invitadosService.getByToken(invitationToken);
        setGuest(guestData);

        const eventData = await getEvento(guestData.eventId);
        setEvent(eventData);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [invitationToken]);

  const handleConfirm = async () => {
    try {
      if (!guest) return;

      await invitadosService.updateByToken(invitationToken, {
        fullName: guest.fullName,
        phone: guest.phone || "",
        email: guest.email || "",
        dietTypeId: guest.dietTypeId,
        guestStatusId: 2,
        tableId: guest.tableId ?? null,
      });

      const updatedGuest = await invitadosService.getByToken(invitationToken);
      setGuest(updatedGuest);
    } catch (err) {
      console.error(err);
      setError("No se pudo confirmar la asistencia");
    }
  };

  const handleDietChange = (e) => {
    setGuest((prev) => ({
      ...prev,
      dietTypeId: Number(e.target.value),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Cargando invitación...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        {error}
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        No se encontró la invitación
      </div>
    );
  }

  const isConfirmed =
    guest?.guestStatusId === 2 ||
    guest?.guestStatus?.name === "Confirmado";

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center p-6">

    <div className="w-full max-w-2xl">

      {/* ===================== */}
      {/* INVITACIÓN (NO CONFIRMADO) */}
      {/* ===================== */}
      {!isConfirmed && (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-[#0C447C] via-[#185FA5] to-[#2B7CD3] p-10 text-center text-white">
            <p className="text-blue-100 text-xs tracking-widest uppercase">
              Invitación exclusiva
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-3 text-white">
              {evento?.eventName}
            </h1>

            <p className="text-blue-100 mt-3">
              Confirmá tu asistencia en un segundo
            </p>
          </div>

          {/* INFO SIMPLE */}
          <div className="p-8 space-y-4">

            <div className="flex justify-between border-b pb-3">
              <span className="text-slate-500">Invitado</span>
              <span className="font-semibold">{guest?.fullName}</span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <span className="text-slate-500">Mesa</span>
              <span className="font-semibold">{guest?.tableName || "Por asignar"}</span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <span className="text-slate-500">Email</span>
              <span className="font-semibold">{guest?.email}</span>
            </div>

            <div className="flex justify-between pb-2">
              <span className="text-slate-500">Teléfono</span>
              <span className="font-semibold">{guest?.phone}</span>
            </div>

            {/* DIETA */}
            <div className="mt-6">
              <label className="text-sm text-slate-500">Tipo de dieta</label>

              <select
                value={guest?.dietTypeId || 1}
                onChange={handleDietChange}
                className="w-full mt-2 p-3 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-[#185FA5]"
              >
                <option value={1}>Estándar</option>
                <option value={2}>Vegetariano</option>
                <option value={3}>Vegano</option>
                <option value={4}>Celíaco</option>
              </select>
            </div>

            {/* BOTÓN */}
            <button
              onClick={handleConfirm}
              className="w-full mt-6 bg-gradient-to-r from-[#0C447C] to-[#185FA5] text-white py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition"
            >
              Confirmar asistencia
            </button>
          </div>
        </div>
      )}

      {/* ===================== */}
      {/* PASE (CONFIRMADO) */}
      {/* ===================== */}
      {isConfirmed && (
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-100">

          <p className="text-sm text-slate-500 uppercase tracking-widest">
            Pase de ingreso
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {evento?.eventName}
          </h2>

          <p className="text-slate-500 mt-2 mb-6">
            Presentá este QR en la entrada
          </p>

          <div className="inline-block p-4 bg-slate-50 rounded-2xl shadow-inner">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${guest?.qrCodeToken}`}
              alt="QR"
              className="mx-auto"
            />
          </div>

          <div className="mt-6 text-sm text-slate-500">
            Invitado: <span className="font-semibold">{guest?.fullName}</span>
          </div>
        </div>
      )}

    </div>
  </div>
);
}