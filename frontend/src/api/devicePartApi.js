import { apiFetch } from "./api";

export const getAllDevicePart = () => {
  return apiFetch("/device_parts");
};

export const createdevices = (data) => {
  return apiFetch("/device_parts", {
    method: "POST",
    body: JSON.stringify(data)
  });
};

export const updatedevices = (id, data) => {
  return apiFetch(`/device_parts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
};

export const deletedevices = (id) => {
  return apiFetch(`/device_parts/${id}`, {
    method: "DELETE"
  });
};