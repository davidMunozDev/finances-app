"use client";

import { type ReactNode, useState } from "react";
import { Box, Button } from "@mui/material";
import { FilterList } from "@mui/icons-material";
import NavigationTabs, { TabItem } from "@/components/NavigationTabs";
import { paths } from "@/config/paths";
import { ExpensesFiltersContext } from "./useExpensesFilters";
import ExpenseFiltersModal from "@/components/ExpenseFiltersModal";
import { useCategories } from "@/data/categories/hooks";
import { type ExpenseFilters as ExpenseFiltersType } from "@/data/expenses/types";

const tabs: TabItem[] = [
  { label: "Completados", path: paths.platform.expenses.completed },
  { label: "Recurrentes", path: paths.platform.expenses.recurring },
];

export default function ExpensesLayout({ children }: { children: ReactNode }) {
  const { categories } = useCategories();
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

  const hasActiveFilters = !!(
    filters.startDate ||
    filters.endDate ||
    filters.categoryId
  );

  return (
    <ExpensesFiltersContext.Provider
      value={{ filters, isModalOpen, openModal, closeModal, applyFilters }}
    >
      <NavigationTabs tabs={tabs} />

      <Box
        sx={{
          px: { xs: 2.5, sm: 3, md: 4, lg: 5 },
          pt: { xs: 2, sm: 2.5 },
          pb: 0,
        }}
      >
        <Box
          sx={{
            maxWidth: { xs: "100%", lg: 900 },
            mx: "auto",
          }}
        >
          <Button
            onClick={openModal}
            variant="outlined"
            startIcon={<FilterList />}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 2.5,
              py: 1,
              fontWeight: 500,
              borderColor: hasActiveFilters ? "primary.main" : "divider",
              color: hasActiveFilters ? "primary.main" : "text.secondary",
              bgcolor: hasActiveFilters ? "primary.50" : "transparent",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "primary.50",
              },
            }}
          >
            Filtros{hasActiveFilters && " (activos)"}
          </Button>
        </Box>
      </Box>

      <ExpenseFiltersModal
        open={isModalOpen}
        onClose={closeModal}
        onApply={applyFilters}
        categories={categories}
        initialFilters={filters}
      />

      {children}
    </ExpensesFiltersContext.Provider>
  );
}
