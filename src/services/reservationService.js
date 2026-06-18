import axios from "axios";
import { services } from "./endpointsUrl";

function getServiceError(error) {
    const status = error.response?.status;
    const message = error.response?.data?.details
        || error.response?.data?.message
        || error.message
        || "No se pudo conectar con el servidor";

    return status ? `${message} (${status})` : message;
}

export async function createReservation({ userId, totalAmount, dateReserved }) {

    try {
        const response = await axios.post(`${services.reservation}`, { userId, totalAmount, dateReserved });
        return response.data;
    }
    catch (error) {
        throw new Error(getServiceError(error));
    }

}

export async function getAllReservations() {
    try {
        const response = await axios.get(`${services.reservation}`);
        return response.data;
    }
    catch (error) {
        throw new Error(getServiceError(error));
    }
}

export async function getAvailability() {
    try {
        const response = await axios.get(`${services.reservation}/disponibility`);
        return response.data;
    }
    catch (error) {
        throw new Error(getServiceError(error));
    }
}
