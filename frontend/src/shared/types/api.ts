export type BackendStatus = "success" | "fail";

export type BackendResponse<T> = {
  status: BackendStatus;
  message?: string;
  data?: T;
};

export type BackendErrorDetails = {
  status: "fail" | "error";
  responseStatus?: number;
  responseData?: unknown;
};
