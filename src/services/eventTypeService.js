import axios from "axios";
import { services } from "./endpointsUrl";

export async function getAllTypes() {
    try{
        const response = await axios.get(`${services.eventType}`);
        return response.data;
    }
    catch(error)
    {
        throw new Error(error.response.data.details || "No se pudo conectar con el servidor");
    }
}