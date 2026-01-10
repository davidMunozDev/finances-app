export interface ProvisionItem {
  id: number;
  name: string;
  amount: number;
}

export interface CategoryWithProvisions {
  id: number;
  name: string;
  color: string;
  user_id: number | null;
  provisions: ProvisionItem[];
}

export interface EditableCategorySectionProps {
  categories: CategoryWithProvisions[];
  onUpdate?: () => void | Promise<void>;
  budgetId: number | null;
}

export interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}
