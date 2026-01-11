import { redirect } from "next/navigation";
import { paths } from "@/config/paths";

export default function ExpensesPage() {
  redirect(paths.platform.expenses.completed);
}
