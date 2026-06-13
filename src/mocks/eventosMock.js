// Datos de ejemplo del módulo de eventos (agenda unificada)
// horaFin = horaInicio + tipo.duracionMinutos
// franja = getFranja(horaInicio): manana 6-14, tarde 14-20, noche resto

/** @type {Array<import('../constants/eventos').Evento>} */
export const eventosMock = [
  // --- 2026-07-05: dos eventos en distintas franjas, sin superposición (incl. limpieza) ---
  // Bautismo 09:00-12:00 + limpieza hasta 13:00 → franja mañana
  {
    id: 'evt-001',
    nombre: 'Bautismo Valentino Romero',
    descripcion: 'Celebración de bautismo con almuerzo posterior.',
    tipoEventoId: 5,
    fecha: '2026-07-05',
    horaInicio: '09:00',
    horaFin: '12:00',
    franja: 'manana',
    estado: 'pendiente',
    cantidadInvitados: 55,
    cliente: {
      nombre: 'Marcela Romero',
      email: 'mromero@email.com',
      telefono: '+54 11 4321-0011',
    },
    reserva: {
      id: 'res-001',
      estado: 'confirmada',
      montoTotal: 180000,
      creadoEn: '2026-05-10T09:00:00Z',
      expiraEn: '2026-05-17T09:00:00Z',
      fechaPago: '2026-05-11T14:30:00Z',
    },
    proveedoresIds: [],
  },
  // Corporativo 15:00-20:00 + limpieza hasta 22:00 → franja tarde
  {
    id: 'evt-002',
    nombre: 'Conferencia Anual TechGroup',
    descripcion: 'Evento corporativo con presentaciones y cóctel.',
    tipoEventoId: 4,
    fecha: '2026-07-05',
    horaInicio: '15:00',
    horaFin: '20:00',
    franja: 'tarde',
    estado: 'pendiente',
    cantidadInvitados: 90,
    cliente: {
      nombre: 'Facundo Giménez',
      email: 'fgimenez@techgroup.com',
      telefono: '+54 11 5500-7890',
    },
    reserva: {
      id: 'res-002',
      estado: 'confirmada',
      montoTotal: 320000,
      creadoEn: '2026-05-12T11:00:00Z',
      expiraEn: '2026-05-19T11:00:00Z',
      fechaPago: '2026-05-13T10:00:00Z',
    },
    proveedoresIds: ['prov-a1b2c3', 'prov-d4e5f6'],
  },

  // --- 2026-07-12: XV años (franja noche) ---
  {
    id: 'evt-003',
    nombre: 'XV de Camila Vega',
    descripcion: 'Fiesta de 15 años temática París.',
    tipoEventoId: 1,
    fecha: '2026-07-12',
    horaInicio: '21:00',
    horaFin: '03:00',
    franja: 'noche',
    estado: 'pendiente',
    cantidadInvitados: 130,
    cliente: {
      nombre: 'Patricia Vega',
      email: 'pvega@email.com',
      telefono: '+54 11 6677-3344',
    },
    reserva: {
      id: 'res-003',
      estado: 'pendiente',
      montoTotal: 420000,
      creadoEn: '2026-05-20T15:00:00Z',
      expiraEn: '2026-05-27T15:00:00Z',
      fechaPago: null,
    },
    proveedoresIds: ['prov-a1b2c3'],
  },

  // --- 2026-07-19: Casamiento único en noche (evento grande) ---
  {
    id: 'evt-004',
    nombre: 'Casamiento Florencia & Tomás',
    descripcion: 'Ceremonia civil + fiesta. Catering incluido.',
    tipoEventoId: 2,
    fecha: '2026-07-19',
    horaInicio: '20:00',
    horaFin: '04:00',
    franja: 'noche',
    estado: 'pendiente',
    cantidadInvitados: 210,
    cliente: {
      nombre: 'Florencia Ibáñez',
      email: 'fibanez@email.com',
      telefono: '+54 11 1122-9988',
    },
    reserva: {
      id: 'res-004',
      estado: 'confirmada',
      montoTotal: 850000,
      creadoEn: '2026-04-15T10:00:00Z',
      expiraEn: '2026-04-22T10:00:00Z',
      fechaPago: '2026-04-16T08:00:00Z',
    },
    proveedoresIds: ['prov-a1b2c3', 'prov-d4e5f6'],
  },

  // --- 2026-07-25: Cumpleaños (franja tarde) ---
  {
    id: 'evt-005',
    nombre: 'Cumpleaños de Luciano Peralta',
    descripcion: 'Festejo de 50 años.',
    tipoEventoId: 3,
    fecha: '2026-07-25',
    horaInicio: '16:00',
    horaFin: '20:00',
    franja: 'tarde',
    estado: 'finalizado',
    cantidadInvitados: 70,
    cliente: {
      nombre: 'Gabriela Peralta',
      email: 'gperalta@email.com',
      telefono: '+54 11 3344-5566',
    },
    reserva: {
      id: 'res-005',
      estado: 'confirmada',
      montoTotal: 220000,
      creadoEn: '2026-04-28T09:00:00Z',
      expiraEn: '2026-05-05T09:00:00Z',
      fechaPago: '2026-04-29T12:00:00Z',
    },
    proveedoresIds: [],
  },

  // --- 2026-08-01: Bautismo (franja mañana) ---
  {
    id: 'evt-006',
    nombre: 'Bautismo Emilia Suárez',
    descripcion: '',
    tipoEventoId: 5,
    fecha: '2026-08-01',
    horaInicio: '10:00',
    horaFin: '13:00',
    franja: 'manana',
    estado: 'pendiente',
    cantidadInvitados: 45,
    cliente: {
      nombre: 'Rodrigo Suárez',
      email: 'rsuarez@email.com',
      telefono: '+54 11 7788-1122',
    },
    reserva: {
      id: 'res-006',
      estado: 'pendiente',
      montoTotal: 140000,
      creadoEn: '2026-06-01T10:00:00Z',
      expiraEn: '2026-06-08T10:00:00Z',
      fechaPago: null,
    },
    proveedoresIds: [],
  },

  // --- 2026-08-08: XV años cancelado ---
  {
    id: 'evt-007',
    nombre: 'XV de Renata Molina',
    descripcion: 'Cancelado por cambio de fecha.',
    tipoEventoId: 1,
    fecha: '2026-08-08',
    horaInicio: '21:00',
    horaFin: '03:00',
    franja: 'noche',
    estado: 'cancelado',
    cantidadInvitados: 100,
    cliente: {
      nombre: 'Silvia Molina',
      email: 'smolina@email.com',
      telefono: '+54 11 9900-4455',
    },
    reserva: {
      id: 'res-007',
      estado: 'cancelada',
      montoTotal: 380000,
      creadoEn: '2026-05-05T14:00:00Z',
      expiraEn: '2026-05-12T14:00:00Z',
      fechaPago: null,
    },
    proveedoresIds: [],
  },

  // --- 2026-08-15: Otro tipo de evento (franja mañana) ---
  {
    id: 'evt-008',
    nombre: 'Exposición de Arte — Galería Norte',
    descripcion: 'Evento cultural con inauguración.',
    tipoEventoId: 6,
    fecha: '2026-08-15',
    horaInicio: '11:00',
    horaFin: '15:00',
    franja: 'manana',
    estado: 'pendiente',
    cantidadInvitados: 30,
    cliente: {
      nombre: 'Hernán Acosta',
      email: 'hacosta@galerianorte.com',
      telefono: '+54 11 2211-6677',
    },
    reserva: {
      id: 'res-008',
      estado: 'confirmada',
      montoTotal: 95000,
      creadoEn: '2026-06-10T08:00:00Z',
      expiraEn: '2026-06-17T08:00:00Z',
      fechaPago: '2026-06-10T17:00:00Z',
    },
    proveedoresIds: ['prov-a1b2c3'],
  },

  // --- 2026-08-22: Casamiento (franja noche) ---
  {
    id: 'evt-009',
    nombre: 'Casamiento Martina & Leandro',
    descripcion: 'Recepción con show en vivo.',
    tipoEventoId: 2,
    fecha: '2026-08-22',
    horaInicio: '21:00',
    horaFin: '05:00',
    franja: 'noche',
    estado: 'pendiente',
    cantidadInvitados: 195,
    cliente: {
      nombre: 'Elena Fonseca',
      email: 'efonseca@email.com',
      telefono: '+54 11 8899-3300',
    },
    reserva: {
      id: 'res-009',
      estado: 'pendiente',
      montoTotal: 790000,
      creadoEn: '2026-06-05T11:00:00Z',
      expiraEn: '2026-06-12T11:00:00Z',
      fechaPago: null,
    },
    proveedoresIds: ['prov-d4e5f6'],
  },
]
