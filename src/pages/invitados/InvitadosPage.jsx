import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

// Constantes alineadas con el Backend
const ESTADOS = { 1: "Pendiente", 2: "Confirmado", 3: "Rechazado" };
const DIETAS = {
  1: "Sin restricciones",
  2: "Vegetariano",
  3: "Vegano",
  4: "Celíaco",
};

const mockMesas = [
  { id: 1, name: "Mesa Principal (10 lug)" },
  { id: 2, name: "Mesa Amigos (8 lug)" },
  { id: 3, name: "Mesa Familia (8 lug)" },
];

const mockInvitados = [
  {
    id: "1",
    fullName: "Juan Pérez",
    phone: "1122334455",
    email: "juan@mail.com",
    guestStatusId: 2,
    dietTypeId: 1,
    tableId: 1,
  },
  {
    id: "2",
    fullName: "María Gómez",
    phone: "1199887766",
    email: "maria@mail.com",
    guestStatusId: 1,
    dietTypeId: 3,
    tableId: null,
  },
  {
    id: "3",
    fullName: "Carlos López",
    phone: "1155443322",
    email: "carlos@mail.com",
    guestStatusId: 3,
    dietTypeId: 4,
    tableId: null,
  },
];

export const InvitadosPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invitados, setInvitados] = useState(mockInvitados);
  const [mesas] = useState(mockMesas);

  const [editingInvitado, setEditingInvitado] = useState(null);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterDiet, setFilterDiet] = useState("todos");
  const [filterMesa, setFilterMesa] = useState("todos"); // Filtro de agrupación
  const [invitadoAEliminar, setInvitadoAEliminar] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (editingInvitado) {
      setValue("fullName", editingInvitado.fullName);
      setValue("email", editingInvitado.email);
      setValue("phone", editingInvitado.phone);
      setValue("guestStatusId", editingInvitado.guestStatusId.toString());
      setValue("dietTypeId", editingInvitado.dietTypeId.toString());
      setValue(
        "tableId",
        editingInvitado.tableId ? editingInvitado.tableId.toString() : "",
      );
    } else {
      reset();
    }
  }, [editingInvitado, setValue, reset]);

  const onSubmit = (data) => {
    const tableIdParseado = data.tableId ? parseInt(data.tableId) : null;

    if (editingInvitado) {
      const invitadosActualizados = invitados.map((inv) =>
        inv.id === editingInvitado.id
          ? {
              ...inv,
              fullName: data.fullName,
              email: data.email,
              phone: data.phone,
              guestStatusId: parseInt(data.guestStatusId),
              dietTypeId: parseInt(data.dietTypeId),
              tableId: tableIdParseado,
            }
          : inv,
      );
      setInvitados(invitadosActualizados);
    } else {
      const nuevoInvitado = {
        id: Date.now().toString(),
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        guestStatusId: 1, // Siempre Pendiente al crear
        dietTypeId: parseInt(data.dietTypeId),
        tableId: tableIdParseado,
      };
      setInvitados([...invitados, nuevoInvitado]);
    }
    cerrarModal();
  };

  const solicitarEliminacion = (id) => setInvitadoAEliminar(id);

  const confirmarEliminacion = () => {
    setInvitados(invitados.filter((inv) => inv.id !== invitadoAEliminar));
    setInvitadoAEliminar(null);
  };

  const cancelarEliminacion = () => setInvitadoAEliminar(null);

  const abrirEditarModal = (invitado) => {
    setEditingInvitado(invitado);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setEditingInvitado(null);
    reset();
  };

  const invitadosFiltrados = invitados
    .filter((invitado) => {
      const cumpleStatus =
        filterStatus === "todos" ||
        invitado.guestStatusId === parseInt(filterStatus);
      const cumpleDiet =
        filterDiet === "todos" || invitado.dietTypeId === parseInt(filterDiet);
      const cumpleMesa =
        filterMesa === "todos" ||
        (filterMesa === "sin_asignar"
          ? invitado.tableId === null
          : invitado.tableId === parseInt(filterMesa));
      return cumpleStatus && cumpleDiet && cumpleMesa;
    })
    .sort((a, b) => (a.tableId || 99999) - (b.tableId || 99999));

  const getNombreMesa = (tableId) => {
    if (!tableId) return "Sin asignar";
    const mesa = mesas.find((m) => m.id === tableId);
    return mesa ? mesa.name : "Sin asignar";
  };

  const exportarCSV = () => {
    const headers = [
      "Nombre Completo",
      "Email",
      "Telefono",
      "Estado",
      "Dieta",
      "Mesa",
    ];
    const rows = invitadosFiltrados.map((inv) => [
      `"${inv.fullName}"`,
      `"${inv.email || ""}"`,
      `"${inv.phone || ""}"`,
      `"${ESTADOS[inv.guestStatusId]}"`,
      `"${DIETAS[inv.dietTypeId]}"`,
      `"${getNombreMesa(inv.tableId)}"`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Listado_Invitados_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de Invitados
        </h1>
        <div className="space-x-3">
          <button
            onClick={exportarCSV}
            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition font-medium shadow-md"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#B5853F] text-white px-4 py-2 rounded-md hover:bg-[#966D32] transition font-medium shadow-md"
          >
            + Agregar Invitado
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-5 items-center">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">
            Estado
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm bg-gray-50 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="todos">Todos los estados</option>
            <option value="1">Pendiente</option>
            <option value="2">Confirmado</option>
            <option value="3">Rechazado</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">
            Dieta
          </label>
          <select
            value={filterDiet}
            onChange={(e) => setFilterDiet(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm bg-gray-50 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="todos">Todas las dietas</option>
            <option value="1">Sin restricciones</option>
            <option value="2">Vegetariano</option>
            <option value="3">Vegano</option>
            <option value="4">Celíaco</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">
            Agrupar por Mesa
          </label>
          <select
            value={filterMesa}
            onChange={(e) => setFilterMesa(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm bg-gray-50 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="todos">Mostrar todas</option>
            <option value="sin_asignar">-- Sin asignar --</option>
            {mesas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-500 self-end mb-2 ml-auto font-medium">
          Mostrando{" "}
          <strong className="text-amber-600">
            {invitadosFiltrados.length}
          </strong>{" "}
          de {invitados.length} invitados.
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Dieta / Mesa
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {invitadosFiltrados.map((invitado) => (
              <tr
                key={invitado.id}
                className="hover:bg-amber-50/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {invitado.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  {invitado.email} <br />
                  <span className="text-gray-500">{invitado.phone}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                    ${
                      invitado.guestStatusId === 2
                        ? "bg-green-100 text-green-800"
                        : invitado.guestStatusId === 1
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {ESTADOS[invitado.guestStatusId]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span className="block font-medium">
                    {DIETAS[invitado.dietTypeId]}
                  </span>
                  <span className="text-xs text-amber-600 font-semibold">
                    {getNombreMesa(invitado.tableId)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => abrirEditarModal(invitado)}
                    className="text-amber-600 hover:text-amber-800 font-bold mr-4 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => solicitarEliminacion(invitado.id)}
                    className="text-red-500 hover:text-red-700 font-bold transition-colors"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL ALTA/EDICIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border-t-4 border-amber-500">
            <h2 className="text-2xl font-extrabold mb-6 text-gray-900">
              {editingInvitado ? "Editar Invitado" : "Nuevo Invitado"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Nombre Completo
                </label>
                <input
                  {...register("fullName", { required: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 focus:ring-amber-500 focus:border-amber-500 transition-shadow"
                />
                {errors.fullName && (
                  <span className="text-red-500 text-xs font-medium">
                    El nombre es obligatorio
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 focus:ring-amber-500 focus:border-amber-500 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">
                    Teléfono
                  </label>
                  <input
                    {...register("phone")}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 focus:ring-amber-500 focus:border-amber-500 transition-shadow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {editingInvitado && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Estado
                    </label>
                    <select
                      {...register("guestStatusId")}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 focus:ring-amber-500 focus:border-amber-500 transition-shadow"
                    >
                      <option value="1">Pendiente</option>
                      <option value="2">Confirmado</option>
                      <option value="3">Rechazado</option>
                    </select>
                  </div>
                )}
                <div className={!editingInvitado ? "col-span-2" : ""}>
                  <label className="block text-sm font-bold text-gray-700">
                    Tipo de Dieta
                  </label>
                  <select
                    {...register("dietTypeId")}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 focus:ring-amber-500 focus:border-amber-500 transition-shadow"
                  >
                    <option value="1">Sin restricciones</option>
                    <option value="2">Vegetariano</option>
                    <option value="3">Vegano</option>
                    <option value="4">Celíaco</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 border-t pt-4 mt-2">
                  Mesa Asignada
                </label>
                <select
                  {...register("tableId")}
                  className="mt-1 block w-full border border-amber-300 bg-amber-50 rounded-md p-2.5 focus:ring-amber-600 focus:border-amber-600 font-medium"
                >
                  <option value="">-- Sin asignar --</option>
                  {mesas.map((mesa) => (
                    <option key={mesa.id} value={mesa.id}>
                      {mesa.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-md hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 text-white font-bold rounded-md hover:bg-amber-700 shadow-md transition"
                >
                  {editingInvitado ? "Guardar Cambios" : "Guardar Invitado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {invitadoAEliminar && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center border-t-4 border-red-500">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">
              Eliminar Invitado
            </h3>
            <p className="text-sm text-gray-600 mb-6 font-medium">
              ¿Estás seguro? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={cancelarEliminacion}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 font-bold w-full transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminacion}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-bold w-full shadow-md transition"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
