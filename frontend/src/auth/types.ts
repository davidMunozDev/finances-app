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

export type AuthUser = {
  id: number;
  email: string;
  full_name: string | null;
  default_currency: string;
  onboarding_completed: boolean;
};

export type AuthResponse = {
  access_token: string;
  user: AuthUser;
};
