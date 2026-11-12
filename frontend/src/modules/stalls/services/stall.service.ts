import api from "../../../shared/lib/axios";
import { requestBackend } from "../../../shared/lib/api-handler";
import type {
  CreateStallInput,
  MenuItemsApiResponse,
  Stall,
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

export async function createStall(payload: CreateStallInput): Promise<unknown> {
  return requestBackend<unknown>(
    {
      method: "POST",
      url: "/stalls/",
      data: payload,
      withCredentials: true,
    },
    "Unable to create the stall.",
  );
}

export async function updateStall(
  stallId: number,
  payload: CreateStallInput,
): Promise<unknown> {
  return requestBackend<unknown>(
    {
      method: "PUT",
      url: `/stalls/${stallId}`,
      data: payload,
      withCredentials: true,
    },
    "Unable to update the stall.",
  );
}

export async function deleteStall(stallId: number): Promise<Stall> {
  return requestBackend<Stall>(
    {
      method: "DELETE",
      url: `/stalls/${stallId}`,
      withCredentials: true,
    },
    "Unable to delete the stall.",
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
