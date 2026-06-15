// Diccionarios base (Alineados con los Seed Data del Backend)
export const ESTADOS = { 1: 'Pendiente', 2: 'Confirmado', 3: 'Rechazado' };
export const DIETAS = { 1: 'Sin restricciones', 2: 'Vegetariano', 3: 'Vegano', 4: 'Celíaco' };

// Opciones de menú con sus precios unitarios
export const mockMenuOpciones = [
  { id: 1, name: 'Menú Tradicional (Carne)', price: 8000 },
  { id: 2, name: 'Menú Vegetariano', price: 6500 },
  { id: 3, name: 'Menú Celíaco', price: 8500 },
  { id: 4, name: 'Menú Vegano', price: 4500 },
];

// Mesas disponibles 
export const mockMesas = [
  { id: 1, name: 'Mesa Principal (10 lug)' },
  { id: 2, name: 'Mesa Amigos (8 lug)' },
  { id: 3, name: 'Mesa Familia (8 lug)' },
];

// Base de datos simulada de invitados con todos los campos unificados
export const mockInvitados = [
  { 
    Id: '1', FullName: 'Juan Pérez', Phone: '1122334455', Email: 'juan@mail.com', 
    GuestStatusId: 2, DietTypeId: 1, menuId: 1, mesaId: 1, alergias: 'Ninguna' 
  },
  { 
    Id: '2', FullName: 'María Gómez', Phone: '1199887766', Email: 'maria@mail.com', 
    GuestStatusId: 1, DietTypeId: 3, menuId: 2, mesaId: null, alergias: 'Maní / Frutos secos' 
  },
  { 
    Id: '3', FullName: 'Carlos López', Phone: '1155443322', Email: 'carlos@mail.com', 
    GuestStatusId: 3, DietTypeId: 4, menuId: 3, mesaId: null, alergias: 'Gluten estricto' 
  },
  { 
    Id: '4', FullName: 'Laura Martínez', Phone: '1133221100', Email: 'laura@mail.com', 
    GuestStatusId: 2, DietTypeId: 1, menuId: 1, mesaId: 1, alergias: 'Mariscos' 
  },
  { 
    Id: '5', FullName: 'Tomás Díaz', Phone: '', Email: '', 
    GuestStatusId: 2, DietTypeId: 1, menuId: 4, mesaId: 3, alergias: 'Ninguna' 
  },
];