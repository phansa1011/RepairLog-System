import { apiFetch } from "./api";

// GET all types (for dropdown)
export const getAllTypes = () => {
  return apiFetch("/types");
};

// CREATE type
export const createType = (data) => {
  return apiFetch("/types", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// UPDATE type
export const updateType = (id, data) => {
  return apiFetch(`/types/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};