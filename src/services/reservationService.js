import axios from "axios";
import { services } from "./endpointsUrl";
import { getApiErrorMessage } from "../utils/apiError";

export async function createReservation({ userId, salonId, eventTypeId, dateReserved }) {

    try {
        const response = await axios.post(`${services.reservation}`, { userId, salonId, eventTypeId, dateReserved });
        return response.data;
    }
    catch (error) {
        throw new Error(getApiErrorMessage(error));
    }

}

export async function getAllReservations() {
    try {
        const response = await axios.get(`${services.reservation}`);
        return response.data;
    }
    catch (error) {
        throw new Error(getApiErrorMessage(error));
    }
}

export async function getAvailability() {
    try {
        const response = await axios.get(`${services.reservation}/disponibility`);
        return response.data;
    }
    catch (error) {
        throw new Error(getApiErrorMessage(error));
    }
}
