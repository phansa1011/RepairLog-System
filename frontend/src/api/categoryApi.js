import { apiFetch } from "./api";

// GET all categories (for dropdown)
export const getAllCategories = () => {
  return apiFetch("/categories");
};

// CREATE category
export const createCategory = (data) => {
  return apiFetch("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// UPDATE category
export const updateCategory = (id, data) => {
  return apiFetch(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};