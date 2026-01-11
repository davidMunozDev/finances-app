"use client";

import { useState, useMemo } from "react";
import { Box, Typography, Skeleton, Button } from "@mui/material";
import { FilterList } from "@mui/icons-material";
import { useBudget } from "@/budget";
import { useRecurringExpenses } from "@/data/recurring-expenses/hooks";
import { useCategories } from "@/data/categories/hooks";
import {
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
} from "@/data/recurring-expenses/api";
import type {
  RecurringExpense,
  CreateRecurringExpenseBody,
} from "@/data/recurring-expenses/types";
import RecurringExpenseCard from "./RecurringExpenseCard";
import RecurringExpenseFormModal from "./RecurringExpenseFormModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/useToast";
import RecurringFiltersModal from "@/components/RecurringFiltersModal";

export default function RecurrentesPage() {
  const { currentBudget } = useBudget();
  const { recurringExpenses, isLoading, mutate } = useRecurringExpenses(
    currentBudget?.id ?? null
  );
  const { categories } = useCategories();
  const { showToast } = useToast();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] =
    useState<RecurringExpense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Local filters state for recurring expenses
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const [filters, setFilters] = useState<{ categoryId?: number | null }>({});

  // Create a Map for O(1) category lookup
  const categoriesMap = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((cat) => {
      map.set(cat.id, cat.name);
    });
    return map;
  }, [categories]);

  // Filter recurring expenses by category
  const filteredRecurringExpenses = useMemo(() => {
    if (!filters.categoryId) {
      return recurringExpenses;
    }
    return recurringExpenses.filter(
      (expense) => expense.category_id === filters.categoryId
    );
  }, [recurringExpenses, filters.categoryId]);

  const hasActiveFilters = !!filters.categoryId;

  const handleOpenEditModal = (expense: RecurringExpense) => {
    setEditingExpense(expense);
    setFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setFormModalOpen(false);
    setEditingExpense(null);
  };

  const handleSubmit = async (data: CreateRecurringExpenseBody) => {
    if (!currentBudget) return;

    try {
      if (editingExpense) {
        // Update existing expense
        await updateRecurringExpense(
          currentBudget.id.toString(),
          editingExpense.id.toString(),
          data
        );
        showToast("Gasto recurrente actualizado correctamente", "success");
      } else {
        // Create new expense
        await createRecurringExpense(currentBudget.id.toString(), data);
        showToast("Gasto recurrente creado correctamente", "success");
      }
      await mutate();
      handleCloseFormModal();
    } catch (error) {
      console.error("Error saving recurring expense:", error);
      showToast("Error al guardar el gasto recurrente", "error");
      throw error;
    }
  };

  const handleOpenDeleteDialog = (expense: RecurringExpense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete || !currentBudget || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteRecurringExpense(
        currentBudget.id.toString(),
        expenseToDelete.id.toString()
      );
      showToast("Gasto recurrente eliminado correctamente", "success");
      await mutate();
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    } catch (error) {
      console.error("Error deleting recurring expense:", error);
      showToast("Error al eliminar el gasto recurrente", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  return (
    <>
      <Box
        sx={{
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
            onClick={() => setFiltersModalOpen(true)}
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

      <Box
        sx={{
          py: { xs: 2.5, sm: 3, md: 4 },
          pb: { xs: 12, md: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 3, lg: 4 },
            maxWidth: { xs: "100%", lg: 900 },
            mx: "auto",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Gastos ({filteredRecurringExpenses.length})
          </Typography>

          {/* Loading State */}
          {isLoading && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[...Array(3)].map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton
                    variant="text"
                    width="40%"
                    height={20}
                    sx={{ mt: 0.5 }}
                  />
                  <Skeleton
                    variant="text"
                    width="30%"
                    height={20}
                    sx={{ mt: 1 }}
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* Empty State */}
          {!isLoading && filteredRecurringExpenses.length === 0 && (
            <Box
              sx={{
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.50",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {hasActiveFilters
                  ? "No hay gastos recurrentes que coincidan con los filtros"
                  : "No hay gastos recurrentes configurados"}
              </Typography>
            </Box>
          )}

          {/* Expenses List */}
          {!isLoading && filteredRecurringExpenses.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {filteredRecurringExpenses.map((expense) => (
                <RecurringExpenseCard
                  key={expense.id}
                  expense={expense}
                  categoryName={categoriesMap.get(expense.category_id)}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteDialog}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Form Modal */}
      <RecurringExpenseFormModal
        open={formModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleSubmit}
        categories={categories}
        expense={editingExpense}
      />

      {/* Filters Modal */}
      <RecurringFiltersModal
        open={filtersModalOpen}
        onClose={() => setFiltersModalOpen(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setFiltersModalOpen(false);
        }}
        categories={categories}
        initialFilters={filters}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar gasto recurrente"
        message={
          expenseToDelete
            ? `¿Estás seguro de que deseas eliminar "${expenseToDelete.name}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmText="Eliminar"
        confirmColor="error"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
