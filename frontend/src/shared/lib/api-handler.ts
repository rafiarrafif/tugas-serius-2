import axios from "axios";

import api from "./axios";
import type { BackendResponse } from "../types/api";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

export class BackendRequestError extends Error {
  readonly status: "fail" | "error";
  readonly responseStatus?: number;
  readonly responseData?: unknown;

  constructor(
    message: string,
    details: {
      status: "fail" | "error";
      responseStatus?: number;
      responseData?: unknown;
    },
  ) {
    super(message);
    this.name = "BackendRequestError";
    this.status = details.status;
    this.responseStatus = details.responseStatus;
    this.responseData = details.responseData;
  }
}

function getBackendErrorMessage(
  message: string | undefined,
  fallbackMessage: string,
): string {
  return message?.trim() || fallbackMessage;
}

export async function handleBackendRequest<T>(
  request: Promise<AxiosResponse<BackendResponse<T>>>,
  fallbackMessage = "Request failed.",
): Promise<T> {
  try {
    const { data } = await request;

    if (data?.status === "fail") {
      throw new BackendRequestError(
        getBackendErrorMessage(data.message, fallbackMessage),
        {
          status: "fail",
          responseData: data,
        },
      );
    }

    if (data?.status !== "success") {
      throw new BackendRequestError(
        getBackendErrorMessage(data?.message, fallbackMessage),
        {
          status: "error",
          responseData: data,
        },
      );
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof BackendRequestError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      throw new BackendRequestError(
        getBackendErrorMessage(
          error.response?.data?.message ?? error.message,
          fallbackMessage,
        ),
        {
          status: "error",
          responseStatus: error.response?.status,
          responseData: error.response?.data,
        },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while processing the request.";

    throw new BackendRequestError(message, {
      status: "error",
    });
  }
}

export async function requestBackend<T>(
  config: AxiosRequestConfig,
  fallbackMessage = "Request failed.",
): Promise<T> {
  const headers =
    config.headers && typeof (config.headers as any).toJSON === "function"
      ? (config.headers as any).toJSON()
      : (config.headers ?? {});

  return handleBackendRequest<T>(
    api.request<BackendResponse<T>>({
      ...config,
      headers: {
        ...headers,
      },
    }),
    fallbackMessage,
  );
}
