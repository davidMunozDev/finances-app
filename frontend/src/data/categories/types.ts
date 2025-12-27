export type Category = {
  id: number;
  user_id: number | null;
  name: string;
  icon: string | null;
};

export type CreateCategoryBody = {
  name: string;
  icon?: string;
};

export type UpdateCategoryBody = {
  name?: string;
  icon?: string;
};
