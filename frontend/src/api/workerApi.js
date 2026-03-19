import { apiFetch } from "./api";

// GET /api/workers
export const getAllWorkers = () => {
  return apiFetch("/workers");
};

// POST /api/workers
export const createWorker = (data) => {
  return apiFetch("/workers", {
    method: "POST",
    body: JSON.stringify(data)
  });
};

// PUT /api/workers/:id
export const updateWorker = (id, data) => {
  return apiFetch(`/workers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
};

// DELETE /api/workers/:id
export const deleteWorker = (id) => {
  return apiFetch(`/workers/${id}`, {
    method: "DELETE"
  });
};

// PATCH /api/workers/:id
export const restoreWorker = (id) => {
  return apiFetch(`/workers/${id}`, {
    method: "PATCH"
  });
};