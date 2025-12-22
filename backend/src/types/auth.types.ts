export type RegisterBody = {
  email: string;
  password: string;
  full_name?: string;
  default_currency?: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type AuthUserResponse = {
  id: number;
  email: string;
  full_name: string | null;
  default_currency: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUserResponse;
};
