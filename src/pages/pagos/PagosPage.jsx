import React, { useState } from 'react';

// 🔄 Cambiado a PagosPage para que coincida perfectamente con el nombre del archivo
export default function PagosPage() {
    // SIMULACIÓN DE ROL (Cambiar a false para ver la vista pura de Cliente)
    const esAdmin = true;

    // Datos hardcodeados de Mariano Figueroa
    const [datosPago, setDatosPago] = useState({
        cliente: "Mariano Figueroa",
        evento: "Boda",
        totalContratado: 450000,
        totalAbonado: 150000,
        saldoPendiente: 300000,
        historial: [
            { id: 1, fecha: "2026-05-10", detalle: "Seña de Reserva", monto: 50000, metodo: "Transferencia", estado: "CONFIRMADO" },
            { id: 2, fecha: "2026-06-01", detalle: "Pago de Cuota", monto: 100000, metodo: "Efectivo", estado: "CONFIRMADO" }
        ]
    });

    const [montoIngresado, setMontoIngresado] = useState('');
    const [metodoSeleccionado, setMetodoSeleccionado] = useState('Transferencia');
    const [conceptoSeleccionado, setConceptoSeleccionado] = useState('Pago de Cuota');

    // Estados para los campos dinámicos de la tarjeta
    const [numTarjeta, setNumTarjeta] = useState('');
    const [vencimiento, setVencimiento] = useState('');
    const [cvc, setCvc] = useState('');

    const handleRegistrarPago = (e) => {
        e.preventDefault();
        const monto = parseFloat(montoIngresado);

        if (isNaN(monto) || monto <= 0 || monto > datosPago.saldoPendiente) {
            alert("Por favor, ingrese un monto válido.");
            return;
        }

        setDatosPago(prev => {
            const nuevoPago = {
                id: prev.historial.length + 1,
                fecha: new Date().toISOString().split('T')[0],
                detalle: conceptoSeleccionado,
                monto: monto,
                metodo: metodoSeleccionado === 'Tarjeta' ? 'Tarjeta' : metodoSeleccionado,
                estado: "PENDIENTE"
            };

            return {
                ...prev,
                historial: [nuevoPago, ...prev.historial]
            };
        });

        setMontoIngresado('');
        setNumTarjeta('');
        setVencimiento('');
        setCvc('');
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen text-slate-800 font-sans">

            {/* Encabezado Principal — Ajustado a Estado de Cuenta */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Estado de Cuenta y Pagos</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Boda
                    </p>
                </div>

                <div className="mt-4 md:mt-0 flex items-center gap-6 justify-between md:justify-end">
                    {esAdmin && (
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente en vista</p>
                            <p className="text-sm font-bold text-slate-700">{datosPago.cliente}</p>
                        </div>
                    )}

                    <button className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-2 px-4 rounded-lg transition-colors shadow-sm">
                        Exportar Estado
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Columna Izquierda: Métricas y Tabla */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Tarjetas de Totales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Contratado</p>
                            <p className="text-xl font-bold text-slate-800 mt-1">${datosPago.totalContratado.toLocaleString()}</p>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Abonado</p>
                            <p className="text-xl font-bold text-emerald-600 mt-1">${datosPago.totalAbonado.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Tabla de Historial corregida */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Historial de Pagos</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 text-gray-400 text-xs font-bold uppercase bg-slate-50/50">
                                        <th className="py-3 px-4">Fecha</th>
                                        <th className="py-3 px-4">Concepto / Detalle</th>
                                        <th className="py-3 px-4">Método</th>
                                        <th className="py-3 px-4">Estado</th>
                                        <th className="py-3 px-4 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-slate-700">
                                    {datosPago.historial.map((pago) => (
                                        <tr key={pago.id} className="hover:bg-slate-50/40 transition-colors">
                                            <td className="py-3 px-4 text-gray-500">{pago.fecha}</td>
                                            <td className="py-3 px-4 font-medium text-slate-900">{pago.detalle}</td>
                                            <td className="py-3 px-4">
                                                <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs">
                                                    {pago.metodo}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${pago.estado === "CONFIRMADO"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-amber-100 text-amber-700"
                                                    }`}>
                                                    {pago.estado}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right font-bold text-slate-900">
                                                ${pago.monto.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Tarjeta Oscura + Formulario */}
                <div className="space-y-6">

                    {/* Tarjeta de Saldo Pendiente corregida */}
                    <div className="bg-slate-950 p-6 rounded-xl text-white shadow-lg border border-slate-800 relative overflow-hidden">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Pendiente</p>
                        <p className="text-xs text-slate-500 mt-0.5">(Calculado en base a pagos confirmados)</p>
                        <p className="text-4xl font-black text-amber-400 mt-4 tracking-tight">
                            ${datosPago.saldoPendiente.toLocaleString()}
                        </p>
                        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                            <span>Transacciones registradas:</span>
                            <span className="bg-slate-800 text-white font-bold px-2 py-0.5 rounded">
                                {datosPago.historial.length}
                            </span>
                        </div>
                    </div>

                    {/* Formulario lateral corregido */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-5">Registrar Pago</h2>
                        <form onSubmit={handleRegistrarPago} className="space-y-4">

                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">Concepto / Detalle</label>
                                <select
                                    value={conceptoSeleccionado}
                                    onChange={(e) => setConceptoSeleccionado(e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 transition-colors"
                                >
                                    <option value="Seña de Reserva">Seña de Reserva</option>
                                    <option value="Pago de Cuota">Pago de Cuota</option>
                                    <option value="Adicional de Catering">Adicional de Catering</option>
                                    <option value="Adicional de Barra">Adicional de Barra</option>
                                    <option value="Saldo Final">Saldo Final</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">Monto ($)</label>
                                <input
                                    type="number"
                                    min="1"
                                    onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()}
                                    value={montoIngresado}
                                    onChange={(e) => setMontoIngresado(e.target.value)}
                                    placeholder="Ej. 50000"
                                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">Método de Pago</label>
                                <select
                                    value={metodoSeleccionado}
                                    onChange={(e) => setMetodoSeleccionado(e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 transition-colors"
                                >
                                    <option value="Transferencia">Transferencia Bancaria</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                                </select>
                            </div>

                            {metodoSeleccionado === 'Tarjeta' && (
                                <div className="space-y-3 pt-2 border-t border-gray-100">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1">Número de Tarjeta</label>
                                        <input
                                            type="text"
                                            maxLength="16"
                                            value={numTarjeta}
                                            onChange={(e) => setNumTarjeta(e.target.value.replace(/\D/g, ''))}
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-800 mb-1">Vencimiento</label>
                                            <input
                                                type="text"
                                                maxLength="5"
                                                value={vencimiento}
                                                onChange={(e) => setVencimiento(e.target.value)}
                                                placeholder="MM/AA"
                                                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 transition-colors"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-800 mb-1">CVC / CCO</label>
                                            <input
                                                type="password"
                                                maxLength="4"
                                                value={cvc}
                                                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                                                placeholder="123"
                                                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMontoIngresado('');
                                        setNumTarjeta('');
                                        setVencimiento('');
                                        setCvc('');
                                    }}
                                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-lg transition-colors text-sm text-center"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="w-2/3 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm text-sm"
                                >
                                    Guardar Pago
                                </button>
                            </div>

                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}