import { IncomeItem } from "@/components/EditableIncomeCard";
import { CategoryWithProvisions } from "@/components/EditableCategorySection/types";

// Colores para las categorías (mismo esquema que CategoryChart)
const CATEGORY_COLORS = [
  "#FF6B6B", // Rojo
  "#4ECDC4", // Turquesa
  "#FFE66D", // Amarillo
  "#FF8C42", // Naranja
  "#A8E6CF", // Verde claro
  "#95E1D3", // Verde agua
  "#F38181", // Rosa
  "#AA96DA", // Morado
];

// Mock data - Ingresos
export const MOCK_INCOMES: IncomeItem[] = [
  {
    id: 1,
    description: "Salario",
    amount: 2500,
  },
];

// Mock data - Categorías de gastos con provisiones
export const MOCK_CATEGORIES: CategoryWithProvisions[] = [
  {
    id: 1,
    name: "Alojamiento",
    color: CATEGORY_COLORS[0],
    user_id: null,
    provisions: [
      { id: 1, name: "Alquiler", amount: 500 },
      { id: 2, name: "Internet", amount: 20 },
      { id: 3, name: "Teléfono", amount: 6 },
    ],
  },
  {
    id: 2,
    name: "Comida",
    color: CATEGORY_COLORS[1],
    user_id: null,
    provisions: [
      { id: 4, name: "Alimentos", amount: 250 },
      { id: 5, name: "Restaurante", amount: 150 },
    ],
  },
  {
    id: 3,
    name: "Transporte",
    color: CATEGORY_COLORS[2],
    user_id: null,
    provisions: [
      { id: 6, name: "Gasolina", amount: 100 },
      { id: 7, name: "Mantenimiento", amount: 50 },
    ],
  },
  {
    id: 4,
    name: "Ocio",
    color: CATEGORY_COLORS[3],
    user_id: null,
    provisions: [
      { id: 8, name: "Entretenimiento", amount: 80 },
      { id: 9, name: "Deportes", amount: 40 },
    ],
  },
];
