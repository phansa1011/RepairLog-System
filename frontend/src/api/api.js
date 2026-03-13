const API_URL = "http://localhost:3000/api";

export async function apiFetch(endpoint, options = {}) {
  const { auth = true, ...fetchOptions } = options;

  const headers = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers || {})
  };

  if (auth) {
    const token = sessionStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || "API error");
  }

  return data;
}