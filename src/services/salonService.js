import axios from "axios";
import { services } from "./endpointsUrl";

function unwrapList(responseData) {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.value)) return responseData.value;
  return [];
}

function getSalonBaseUrl() {
  return services.salon.replace(/\/api\/v1\/Salon\/?$/i, "");
}

function normalizeImage(src) {
  if (!src) return "";
  const value = String(src).trim();
  if (!value) return "";
  if (value.startsWith("http") || value.startsWith("data:")) return value;
  if (/^[A-Za-z0-9+/=]+$/.test(value) && value.length > 100) {
    return `data:image/jpeg;base64,${value}`;
  }
  return `${getSalonBaseUrl()}${value.startsWith("/") ? "" : "/"}${value}`;
}

function normalizeSalon(salon) {
  return {
    ...salon,
    id: salon.id ?? salon.salonId,
    salonId: salon.salonId ?? salon.id,
    salonName: salon.salonName ?? salon.name,
    profilePicture: normalizeImage(
      salon.profilePicture ??
        salon.picture ??
        salon.image ??
        salon.imageUrl ??
        salon.photoUrl,
    ),
  };
}

export async function getSalons() {
  const { data } = await axios.get(services.salon);
  return unwrapList(data).map(normalizeSalon);
}

export async function getSalon(id) {
  const { data } = await axios.get(services.salon);
  return unwrapList(data).map(normalizeSalon);
}
export async function getSalonsName()
{
    const {data} = await axios.get(`${services.salon}/salonsName`);
    return data
}