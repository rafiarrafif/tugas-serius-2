export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  role: "customer";
};

export type RegisterResponse = string;
