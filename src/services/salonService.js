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
    photos: Array.isArray(salon.photos)
      ? salon.photos.map((img) => normalizeImage(img))
      : Array.isArray(salon.images)
        ? salon.images.map((img) => normalizeImage(img))
        : [],
  };
}

export async function createSalon(salonData) {
  const { data } = await axios.post(services.salon, salonData);

  const createdSalon = data?.data ?? data;

  return normalizeSalon(createdSalon);
}

export async function updateSalon(salonId, salonData) {
  const { data } = await axios.put(`${services.salon}/${salonId}`, salonData);

  const updatedSalon = data?.data ?? data;

  return normalizeSalon(updatedSalon);
}

export async function getSalons(page = 1, size = 10) {
  const { data } = await axios.get(services.salon, {
    params: {
      page: page,
      size: size,
    },
  });

  return unwrapList(data).map(normalizeSalon);
}

export async function getSalon(id) {
  const { data } = await axios.get(services.salon);
  return unwrapList(data).map(normalizeSalon);
}
export async function getSalonsName() {
  const { data } = await axios.get(`${services.salon}/salonsName`);
  return data;
}

export async function getEventsBySalon(id, date = null) {
  const { data } = await axios.get(`${services.salon}/${id}/events`, {
    params: date ? { eventDate: date } : {},
  });

  return data;
}

export async function getSalonAvailable(salonId) {
  try
  {
    const {data} = await axios.get(`${services.salon}/salon-available/${salonId}`);
    return data;
  }
  catch(error){
      console.error("Error al obtener la disponibilidad del salón");
      throw new Error(
        error.response?.data?.details || "No se pudo conectar con el servidor",
      );
    }

}


