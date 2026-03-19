import { apiFetch } from "./api";

export const login = (data) => {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
    auth: false
  });
};