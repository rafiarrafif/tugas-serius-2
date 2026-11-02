import axios from "axios";

const backendEndpoint =
  (import.meta.env.BACKEND_ENDPOINT as string | undefined) ??
  (import.meta.env.VITE_BACKEND_ENDPOINT as string | undefined) ??
  "";

export const api = axios.create({
  baseURL: backendEndpoint.replace(/\/+$/, ""),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
