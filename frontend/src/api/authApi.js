import { apiFetch } from "./api";

export const login = (data) => {
  return apiFetch("/login", {
    method: "POST",
    body: JSON.stringify(data),
    auth: false
  });
};