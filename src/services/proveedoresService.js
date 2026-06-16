// TODO: conectar con API real (salon404-proveedores)
import { v4 as uuidv4 } from 'uuid';

const MOCK_DELAY = 800;
const ERROR_RATE = 0.1; // 10% de chance de fallar (simulando 500 o network error)

let proveedoresMock = [
  {
    id: '1',
    nombre: 'Sonido Premium XL',
    rubro: 'Sonido e Iluminación',
    telefono: '11-1234-5678',
    email: 'contacto@sonidoxl.com',
    descripcion: 'Equipos de sonido, luces y DJ para eventos grandes.',
    activo: true,
  },
  {
    id: '2',
    nombre: 'Catering Delicias',
    rubro: 'Gastronomía',
    telefono: '11-9876-5432',
    email: 'info@delicias.com',
    descripcion: 'Servicio integral de catering, opciones formales e informales.',
    activo: true,
  },
  {
    id: '3',
    nombre: 'Foto & Video Estudio',
    rubro: 'Fotografía',
    telefono: '11-5555-4444',
    email: 'fotos@estudio.com',
    descripcion: 'Fotografía analógica y digital, drones.',
    activo: false,
  }
];

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const maybeThrow = () => {
  if (Math.random() < ERROR_RATE) {
    throw new Error('Error de conexión con el servidor.');
  }
};

export const getProveedores = async () => {
  await wait(MOCK_DELAY);
  maybeThrow();
  return [...proveedoresMock];
};

export const createProveedor = async (data) => {
  await wait(MOCK_DELAY);
  maybeThrow();
  const nuevo = {
    ...data,
    id: uuidv4(),
  };
  proveedoresMock.push(nuevo);
  return nuevo;
};

export const updateProveedor = async (id, data) => {
  await wait(MOCK_DELAY);
  maybeThrow();
  const index = proveedoresMock.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Proveedor no encontrado');
  
  proveedoresMock[index] = {
    ...proveedoresMock[index],
    ...data,
  };
  return proveedoresMock[index];
};

export const deleteProveedor = async (id) => {
  await wait(MOCK_DELAY);
  maybeThrow();
  proveedoresMock = proveedoresMock.filter(p => p.id !== id);
  return true;
};
