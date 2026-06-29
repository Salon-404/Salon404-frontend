import axios from "axios";
import { services } from "./endpointsUrl";

const API_URL = services.email;

export async function sendMasiveEmails(eventId) {
  const { data } = await axios.post(
    `${API_URL}/masive-email-invitation?eventId=${eventId}`,
  );
  return data;
}
