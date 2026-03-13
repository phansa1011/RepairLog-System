import { apiFetch } from "./api";

export const getAllPart = () => {
  return apiFetch("/parts");
};

export const getPartById = (id) => {
  return apiFetch(`/parts/${id}`);
};

export const createPart = (data) => {
  return apiFetch("/parts", {
    method: "POST",
    body: JSON.stringify(data)
  });
};

export const updatePart = (id, data) => {
  return apiFetch(`/parts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
};

export const deletePart = (id) => {
  return apiFetch(`/parts/${id}`, {
    method: "DELETE"
  });
};

export const restorePart = (id) => {
  return apiFetch(`/parts/${id}`, {
    method: "PATCH"
  });
};