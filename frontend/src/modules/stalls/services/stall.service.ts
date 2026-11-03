import api from "../../../shared/lib/axios";
import { requestBackend } from "../../../shared/lib/api-handler";
import type {
  CreateStallInput,
  MenuItemsApiResponse,
  StallDetailApiResponse,
  StallFilterParams,
  StallListApiResponse,
  VerifiedUserPayload,
} from "../types/stall.types";

export async function getCurrentUser(
  token: string,
): Promise<VerifiedUserPayload> {
  return requestBackend<VerifiedUserPayload>(
    {
      method: "GET",
      url: "/auth/me",
      headers: { auth_token: token },
    },
    "Unable to verify your account.",
  );
}

export async function getVerifiedUserRole(
  token: string,
): Promise<string | undefined> {
  const user = await getCurrentUser(token);
  return user.role;
}

export async function createStall(
  payload: CreateStallInput,
  token: string,
): Promise<unknown> {
  return requestBackend<unknown>(
    {
      method: "POST",
      url: "/stalls/",
      data: payload,
      headers: { auth_token: token },
    },
    "Unable to create the stall.",
  );
}

export async function updateStall(
  stallId: number,
  payload: CreateStallInput,
  token: string,
): Promise<unknown> {
  return requestBackend<unknown>(
    {
      method: "PUT",
      url: `/stalls/${stallId}`,
      data: payload,
      headers: { auth_token: token },
    },
    "Unable to update the stall.",
  );
}

export async function getStalls(params: StallFilterParams = {}) {
  const queryParams = {
    ...(params.search ? { search: params.search.trim() } : {}),
    ...(params.category ? { category: params.category.trim() } : {}),
    ...(params.page ? { page: params.page } : {}),
    ...(params.limit ? { limit: params.limit } : {}),
  };

  const response = await api.get<StallListApiResponse>("/stalls", {
    params: queryParams,
  });

  return response.data;
}

export async function getStallById(stallId: number) {
  const response = await api.get<StallDetailApiResponse>(`/stalls/${stallId}`);
  return response.data;
}

export async function getMenuItemsForStall(
  stallId: number,
  params: { page?: number; limit?: number } = {},
) {
  const response = await api.get<MenuItemsApiResponse>("/menu-items", {
    params: {
      stallId,
      ...(params.page ? { page: params.page } : {}),
      ...(params.limit ? { limit: params.limit } : {}),
    },
  });

  return response.data;
}
