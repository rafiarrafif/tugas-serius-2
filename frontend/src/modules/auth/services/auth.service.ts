import {
  BackendRequestError,
  requestBackend,
} from "../../../shared/lib/api-handler";
import type { RegisterRequest, RegisterResponse } from "../types/auth.types";

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
