import { useNavigate } from "react-router-dom";
import Navbar from "../../components/global/Navbar";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 min-h-[520px]">
        {/* Izquierda: texto */}
        <div className="bg-[#0C447C] flex flex-col justify-center gap-6 px-16 py-20">
          <span className="text-xs tracking-widest text-[#85B7EB] uppercase">
            Gestión de eventos
          </span>
          <h1 className="text-4xl font-semibold text-white leading-snug">
            Tu próximo evento,{" "}
            <em className="not-italic text-[#85B7EB]">
              perfectamente organizado
            </em>
          </h1>
          <p className="text-[#B5D4F4] text-base leading-relaxed max-w-md">
            Reservá tu salón, elegí el horario y coordiná cada detalle desde
            un solo lugar. Sin llamadas, sin formularios en papel.
          </p>
          <button
            onClick={() => navigate("/disponibilidad")}
            className="w-fit rounded-lg bg-[#378ADD] px-6 py-3 text-white text-sm hover:bg-[#185FA5] transition-colors"
          >
            Ver disponibilidad ↗
          </button>
        </div>

        {/* Derecha: tarjetas de horario */}
        <div className="bg-[#E6F1FB] flex items-center justify-center px-12">
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <div className="bg-white rounded-xl border border-[#B5D4F4] px-5 py-4 flex items-center gap-4 shadow-sm">
              <span className="text-[#185FA5] text-xl"></span>
              <div>
                <div className="text-sm font-semibold text-[#185FA5]">09:00 — 15:00</div>
                <div className="text-xs text-slate-500">Salón Principal · disponible</div>
              </div>
            </div>
            <div className="bg-[#185FA5] rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <span className="text-[#85B7EB] text-xl">✓</span>
              <div>
                <div className="text-sm font-semibold text-white">16:00 — 22:00</div>
                <div className="text-xs text-[#85B7EB]">Reservado · XV de Juliana</div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#B5D4F4] px-5 py-4 flex items-center gap-4 shadow-sm">
              <span className="text-[#185FA5] text-xl"></span>
              <div>
                <div className="text-sm font-semibold text-[#185FA5]">23:00 — 05:00</div>
                <div className="text-xs text-slate-500">Salón Principal · disponible</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-3 bg-[#185FA5]">
        {[
          { num: "+500", label: "eventos organizados" },
          { num: "3", label: "salones disponibles" },
          { num: "98%", label: "clientes satisfechos" },
        ].map((s, i) => (
          <div
            key={i}
            className={`py-6 text-center ${i < 2 ? "border-r border-[#0C447C]" : ""}`}
          >
            <div className="text-3xl font-semibold text-white">{s.num}</div>
            <div className="text-sm text-[#85B7EB] mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── TIPOS DE EVENTO ──────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white">
        <h2 className="text-2xl font-semibold text-slate-800 text-center mb-2">
          Tipos de evento
        </h2>
        <p className="text-sm text-slate-500 text-center mb-10">
          Elegí la categoría que mejor describe tu celebración
        </p>
        <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { icon: "", name: "Casamientos" },
            { icon: "", name: "XV Años" },
            { icon: "", name: "Corporativos" },
            { icon: "", name: "Otros" },
          ].map((ev) => (
            <div
              key={ev.name}
              className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#378ADD] transition-colors"
            >
              <div className="text-3xl mb-3">{ev.icon}</div>
              <div className="text-sm font-medium text-slate-700">{ev.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-[#E6F1FB]">
        <h2 className="text-2xl font-semibold text-[#0C447C] text-center mb-10">
          ¿Cómo funciona?
        </h2>
        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            {
              paso: "PASO 01",
              title: "Elegí una fecha",
              desc: "Consultá el calendario y encontrá los horarios disponibles en tiempo real.",
            },
            {
              paso: "PASO 02",
              title: "Reservá tu horario",
              desc: "Seleccioná el tipo de evento y el salón. Confirmamos la reserva al instante.",
            },
            {
              paso: "PASO 03",
              title: "Disfrutá tu evento",
              desc: "Nosotros nos encargamos de los detalles para que vos solo disfrutes.",
            },
          ].map((s) => (
            <div
              key={s.paso}
              className="bg-white rounded-xl border border-[#B5D4F4] p-6"
            >
              <div className="text-xs font-medium text-[#378ADD] tracking-widest mb-3">
                {s.paso}
              </div>
              <div className="text-base font-semibold text-[#0C447C] mb-2">
                {s.title}
              </div>
              <div className="text-sm text-slate-500 leading-relaxed">
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#0C447C] py-20 text-center">
        <h2 className="text-3xl font-semibold text-white mb-3">
          ¿Listo para reservar tu fecha?
        </h2>
        <p className="text-[#85B7EB] text-base mb-8">
          Registrate y consultá disponibilidad en tiempo real. Sin turnos, sin esperas.
        </p>
        <button
          onClick={() => navigate("/register")}
          className="rounded-lg bg-white px-8 py-3 font-medium text-[#185FA5] hover:bg-[#E6F1FB] transition-colors"
        >
          Crear cuenta ↗
        </button>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#042C53] flex items-center justify-between px-8 py-5">
        <span className="text-[#85B7EB] font-medium text-base">EventosPro</span>
        <span className="text-[#378ADD] text-xs">© 2026 · Todos los derechos reservados</span>
      </footer>
    </div>
  );
}