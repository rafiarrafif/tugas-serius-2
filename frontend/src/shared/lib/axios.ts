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

api.interceptors.request.use((config) => {
  const existingHeaders =
    config.headers && typeof (config.headers as any).toJSON === "function"
      ? (config.headers as any).toJSON()
      : (config.headers ?? {});

  const outgoingHeaders = { ...existingHeaders };
  const headerAuthToken =
    typeof outgoingHeaders.auth_token === "string"
      ? outgoingHeaders.auth_token
      : undefined;

  delete outgoingHeaders.auth_token;

  config.headers = {
    ...outgoingHeaders,
    ...(headerAuthToken ? { Authorization: `Bearer ${headerAuthToken}` } : {}),
  };

  return config;
});

export default api;
