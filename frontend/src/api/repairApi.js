import { apiFetch } from "./api";

export const getAllRepairs = () => {
  return apiFetch("/repair");
};

export const getRepairsById = (id) => {
  return apiFetch(`/repair/${id}`);
};

export const createRepairs = (data) => {
  return apiFetch("/repair", {
    method: "POST",
    body: JSON.stringify(data)
  });
};

export const updateRepairs = (id, data) => {
  return apiFetch(`/repair/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
};

export const deleteRepairs = (id) => {
  return apiFetch(`/repair/${id}`, {
    method: "DELETE"
  });
};