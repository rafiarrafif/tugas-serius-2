export type Stall = {
  id: number;
  ownerId: number;
  name: string;
  category: string | null;
  location: string | null;
  description: string | null;
  avgRating: number;
  reviewCount: number;
  isPopular: boolean;
};

export type StallListMeta = {
  page: number;
  limit: number;
  total: number;
};

export type StallListApiResponse = {
  status: "success" | "fail";
  meta: StallListMeta;
  data: Stall[];
  message?: string;
};

export type StallDetailApiResponse = {
  status: "success" | "fail";
  data: Stall;
  message?: string;
};

export type MenuItem = {
  id: number;
  stallId: number;
  name: string;
  price: number;
  isAvailable: boolean;
  stall?: {
    id: number;
    name: string;
    category: string | null;
    location: string | null;
  } | null;
};

export type MenuItemsApiResponse = {
  status: "success" | "fail";
  meta: StallListMeta;
  data: MenuItem[];
  message?: string;
};

export type StallFilterParams = {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
};
