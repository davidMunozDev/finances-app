export type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  full_name: string | null;
  default_currency: string;
  onboarding_completed: boolean;
  created_at?: string;
};
