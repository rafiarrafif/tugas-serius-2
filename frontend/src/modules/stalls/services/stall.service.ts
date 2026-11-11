import api from "../../../shared/lib/axios";
import type {
  MenuItemsApiResponse,
  StallDetailApiResponse,
  StallFilterParams,
  StallListApiResponse,
} from "../types/stall.types";

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
