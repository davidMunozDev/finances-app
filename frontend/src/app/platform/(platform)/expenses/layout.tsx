"use client";

import { type ReactNode, useState } from "react";
import { Box } from "@mui/material";
import NavigationTabs, { TabItem } from "@/components/NavigationTabs";
import { paths } from "@/config/paths";
import { ExpensesFiltersContext } from "./useExpensesFilters";
import { type ExpenseFilters as ExpenseFiltersType } from "@/data/expenses/types";

const tabs: TabItem[] = [
  { label: "Completados", path: paths.platform.expenses.completed },
  { label: "Recurrentes", path: paths.platform.expenses.recurring },
];

export default function ExpensesLayout({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<
    ExpenseFiltersType & { categoryId?: number | null }
  >({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const applyFilters = (
    newFilters: ExpenseFiltersType & { categoryId?: number | null }
  ) => {
    setFilters(newFilters);
  };

  return (
    <ExpensesFiltersContext.Provider
      value={{ filters, isModalOpen, openModal, closeModal, applyFilters }}
    >
      <NavigationTabs tabs={tabs} />

      {children}
    </ExpensesFiltersContext.Provider>
  );
}
