import {
  BackendRequestError,
  requestBackend,
} from "../../../shared/lib/api-handler";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth.types";

export async function loginCustomer(payload: LoginRequest): Promise<string> {
  try {
    const response = await requestBackend<LoginResponse>(
      {
        method: "POST",
        url: "/auth/login",
        data: payload,
      },
      "Unable to sign in.",
    );

    if (typeof response?.token !== "string" || response.token.length === 0) {
      throw new BackendRequestError(
        "The server did not return an auth token.",
        {
          status: "error",
        },
      );
    }

    return response.token;
  } catch (error) {
    if (error instanceof BackendRequestError) {
      throw error;
    }

    throw new Error("Unable to sign in.");
  }
}

export async function registerCustomer(
  payload: RegisterRequest,
): Promise<RegisterResponse> {
  try {
    return await requestBackend<RegisterResponse>(
      {
        method: "POST",
        url: "/auth/register",
        data: payload,
      },
      "Unable to create your account.",
    );
  } catch (error) {
    if (error instanceof BackendRequestError) {
      throw error;
    }

    throw new Error("Unable to create your account.");
  }
}
