export default function StatusBadge({ status }) {
  const disponible = status?.toLowerCase() === "disponible";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
        disponible
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          disponible ? "bg-green-600" : "bg-red-600"
        }`}
      />

      {status}
    </span>
  );
}