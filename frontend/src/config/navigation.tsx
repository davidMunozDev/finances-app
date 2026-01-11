import {
  BarChart,
  PieChart,
  Add,
  Try,
  TrendingDown,
} from "@mui/icons-material";
import { paths } from "./paths";

export const mainNavItems = [
  { text: "Dashboard", icon: BarChart, href: paths.platform.home },
  { text: "Presupuesto", icon: PieChart, href: paths.platform.budget },
  { text: "Añadir", icon: Add, href: paths.platform.addExpense },
  {
    text: "Gastos",
    icon: TrendingDown,
    href: paths.platform.expenses.completed,
  },
  { text: "Chat IA", icon: Try, href: "#" },
];
