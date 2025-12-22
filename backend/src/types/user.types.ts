export type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  full_name: string | null;
  default_currency: string;
  created_at?: string;
};
