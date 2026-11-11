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

  const fallbackAuthToken =
    (typeof window !== "undefined" &&
      window.localStorage.getItem("auth_token")) ??
    (import.meta.env.VITE_API_TOKEN as string | undefined) ??
    (import.meta.env.AUTH_TOKEN as string | undefined);

  const resolvedAuthToken = headerAuthToken ?? fallbackAuthToken;

  delete outgoingHeaders.auth_token;

  config.headers = {
    ...outgoingHeaders,
    ...(resolvedAuthToken
      ? { Authorization: `Bearer ${resolvedAuthToken}` }
      : {}),
  };

  return config;
});

export default api;
