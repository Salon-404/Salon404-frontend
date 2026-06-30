export default function InfoCard({ titulo, valor }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {titulo}
      </div>

      <div className="mt-2 text-xl font-bold text-slate-800">
        {valor}
      </div>
    </div>
  );
}