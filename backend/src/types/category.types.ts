export type CategoryRow = {
  id: number;
  user_id: number | null;
  name: string;
  icon: string | null;
};

export type CreateCategoryBody = {
  name: string;
  icon?: string;
};
