import { apiFetch } from "./api";

export const getAllDevice = () => {
  return apiFetch("/devices");
};

export const getDeviceById = (id) => {
  return apiFetch(`/devices/${id}`);
};

export const createDevice = (data) => {
  return apiFetch("/devices", {
    method: "POST",
    body: JSON.stringify(data)
  });
};

export const updateDevice = (id, data) => {
  return apiFetch(`/devices/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
};

export const deleteDevice = (id) => {
  return apiFetch(`/devices/${id}`, {
    method: "DELETE"
  });
};

export const restoreDevice = (id) => {
  return apiFetch(`/devices/${id}`, {
    method: "PATCH"
  });
};