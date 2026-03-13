import { apiFetch } from "./api";

export const getAllLocation = () => {
  return apiFetch("/locations");
};

export const getLocationById = (id) => {
  return apiFetch(`/locations/${id}`);
};

export const createLocation = (data) => {
  return apiFetch("/locations", {
    method: "POST",
    body: JSON.stringify(data)
  });
};

export const updateLocation = (id, data) => {
  return apiFetch(`/locations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
};

export const deleteLocation = (id) => {
  return apiFetch(`/locations/${id}`, {
    method: "DELETE"
  });
};

export const restoreLocation = (id) => {
  return apiFetch(`/locations/${id}`, {
    method: "PATCH"
  });
};