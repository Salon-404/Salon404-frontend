import axios from "axios";
import { services } from "./endpointsUrl";
import { TOKEN_KEY } from "../constants/auth";

const API_URL = services.email;

function authHeader() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function sendMasiveEmails(eventId) {
  const { data } = await axios.post(
    `${API_URL}/masive-email-invitation?eventId=${eventId}`,
    null,
    { headers: authHeader() },
  );
  return data;
}
