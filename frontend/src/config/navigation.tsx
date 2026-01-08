import { BarChart, PieChart, Add, TrendingUp, Try } from "@mui/icons-material";
import { paths } from "./paths";

export const mainNavItems = [
  { text: "Dashboard", icon: BarChart, href: paths.platform.home },
  { text: "Presupuesto", icon: PieChart, href: "#" },
  { text: "Añadir", icon: Add, href: paths.platform.addExpense },
  { text: "Ingresos", icon: TrendingUp, href: "#" },
  { text: "Chat IA", icon: Try, href: "#" },
];
