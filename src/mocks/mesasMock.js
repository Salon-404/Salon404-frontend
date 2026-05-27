// Datos de prueba del módulo de mesas. Se eliminan al integrar el backend.

// Layout global del salón con 5 mesas posicionadas en el canvas
export const layoutMock = {
  canvasAncho: 900,
  canvasAlto:  600,
  mesas: [
    {
      id: 1, nombre: 'Mesa 1', forma: 'redonda',
      capacidad: 8, grupo: 'familia',
      x: 80,  y: 60,  diametro: 100, rotacion: 0,
    },
    {
      id: 2, nombre: 'Mesa 2', forma: 'redonda',
      capacidad: 6, grupo: 'familia',
      x: 260, y: 60,  diametro: 100, rotacion: 0,
    },
    {
      id: 3, nombre: 'Mesa 3', forma: 'rectangular',
      capacidad: 10, grupo: 'sin_grupo',
      x: 460, y: 180, ancho: 130, alto: 85, rotacion: 0,
    },
    {
      id: 4, nombre: 'Mesa 4', forma: 'redonda',
      capacidad: 8, grupo: 'amigos',
      x: 680, y: 380, diametro: 100, rotacion: 0,
    },
    {
      id: 5, nombre: 'Mesa 5', forma: 'rectangular',
      capacidad: 12, grupo: 'ninos',
      x: 90,  y: 350, ancho: 150, alto: 90, rotacion: 0,
    },
  ],
}

// Invitados de ejemplo para la reserva con id=1
export const invitadosMock = {
  1: [
    { id: 10, nombre: 'Ana García',       reservaId: 1 },
    { id: 11, nombre: 'Luis García',      reservaId: 1 },
    { id: 12, nombre: 'Marta López',      reservaId: 1 },
    { id: 13, nombre: 'Carlos Ruiz',      reservaId: 1 },
    { id: 14, nombre: 'Valeria Díaz',     reservaId: 1 },
    { id: 15, nombre: 'Tomás Sánchez',    reservaId: 1 },
    { id: 16, nombre: 'Lucía Fernández',  reservaId: 1 },
    { id: 17, nombre: 'Marcos Torres',    reservaId: 1 },
  ],
}

// Asignaciones de invitados a mesas para la reserva con id=1
// Algunas mesas están parcialmente ocupadas, otras vacías
export const asignacionesMock = {
  1: [
    { id: 101, reservaId: 1, mesaId: 1, invitadoId: 10 },
    { id: 102, reservaId: 1, mesaId: 1, invitadoId: 11 },
    { id: 103, reservaId: 1, mesaId: 2, invitadoId: 12 },
  ],
}

// IDs de mesas que tienen invitados asignados en alguna reserva activa.
// El mock los usa para simular el error 409 al intentar eliminar esas mesas.
export const MESAS_CON_ASIGNACIONES = [1, 2]

let nextMesaId    = 6
let nextAsignId   = 200

// Genera un ID único para mesas nuevas creadas en el mock
export function nextMesaMockId()    { return nextMesaId++ }

// Genera un ID único para asignaciones nuevas creadas en el mock
export function nextAsignMockId()   { return nextAsignId++ }
