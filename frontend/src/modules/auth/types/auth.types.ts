export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  role: "customer";
};

export type RegisterResponse = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "owner" | "customer";
  createdAt: string | null;
};

export type RegisterActionResult = {
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password", string>>;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "admin" | "owner" | "customer";
    createdAt: string | null;
  };
};

export type CurrentUserResponse = {
  userId: number;
  name: string;
  email: string;
  role: "admin" | "owner" | "customer";
};

export type LoginActionResult = {
  ok?: true;
  message?: string;
  fieldErrors?: Partial<Record<keyof LoginRequest, string>>;
};
