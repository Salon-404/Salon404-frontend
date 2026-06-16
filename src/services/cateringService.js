// TODO: conectar con API real (salon404-eventos/catering)

const MOCK_DELAY = 500;
const ERROR_RATE = 0.1;

export const CATERING_OPTIONS = [
  {
    id: 'basico',
    nivel: '🟢 Opción Básica',
    precio: 15000,
    descripcion: 'Recepción simple con snacks, sándwiches de miga y pizza libre. Bebidas sin alcohol incluidas.',
    proveedorSugerido: 'Catering Delicias (Básico)',
  },
  {
    id: 'estandar',
    nivel: '🟡 Opción Estándar',
    precio: 25000,
    descripcion: 'Recepción completa, plato principal (pollo relleno o carne al horno), postre helado. Bebidas con y sin alcohol.',
    proveedorSugerido: 'Catering Delicias (Estándar)',
  },
  {
    id: 'premium',
    nivel: '🔴 Opción Premium',
    precio: 45000,
    descripcion: 'Recepción gourmet, sushi, asado libre, barra de tragos internacionales, mesa dulce y cascada de chocolate.',
    proveedorSugerido: 'Premium Events & Catering',
  }
];

// Base de datos local mock de selección por evento
let seleccionesMock = {
  // Ej: '1': 'estandar'
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const maybeThrow = () => {
  if (Math.random() < ERROR_RATE) {
    throw new Error('Error de conexión con el servidor (Catering).');
  }
};

export const getCateringOptions = async (eventoId) => {
  await wait(MOCK_DELAY);
  maybeThrow();
  return {
    opciones: CATERING_OPTIONS,
    seleccionActual: seleccionesMock[eventoId] || null,
  };
};

export const saveCateringSelection = async (eventoId, opcionId) => {
  await wait(MOCK_DELAY);
  maybeThrow();
  seleccionesMock[eventoId] = opcionId;
  return {
    success: true,
    seleccionActual: opcionId,
  };
};
