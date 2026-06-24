import axios from "axios";
import { services } from "./endpointsUrl";

const urlBase = services.providerCatalog;

export const obtenerTiposdeProveedores = () => axios.get(`${urlBase}/types`);

export const obtenerEstadosdeProveedores = () =>
  axios.get(`${urlBase}/statuses`);
