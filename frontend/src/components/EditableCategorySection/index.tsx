"use client";

import { useState } from "react";
import { Box, Typography, Button, Collapse } from "@mui/material";
import { AddCircleOutline } from "@mui/icons-material";
import { useToast } from "@/hooks/useToast";
import {
  createProvision,
  updateProvision,
  deleteProvision,
} from "@/data/provisions/api";
import { updateCategory, deleteCategory } from "@/data/categories/api";
import ConfirmDialog from "@/components/ConfirmDialog";
import CreateCategoryModal from "@/components/CreateCategoryModal";
import { EditableCategorySectionProps, ProvisionItem } from "./types";
import { getErrorMessage } from "./utils";
import CategoryHeader from "./CategoryHeader";
import ProvisionsList from "./ProvisionsList";

export default function EditableCategorySection({
  categories,
  onUpdate,
  budgetId,
}: EditableCategorySectionProps) {
  const { showToast } = useToast();
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set(categories.map((cat) => cat.id))
  );
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );
  const [editingProvisionId, setEditingProvisionId] = useState<number | null>(
    null
  );
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [newProvisionCategoryId, setNewProvisionCategoryId] = useState<
    number | null
  >(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<
    (typeof categories)[0] | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleEditCategory = (category: (typeof categories)[0]) => {
    setEditingCategoryId(category.id);
    setEditName(category.name);
  };

  const handleSaveCategory = async () => {
    const trimmedName = editName.trim();

    // Client-side validation
    if (trimmedName.length < 2) {
      showToast("El nombre debe tener al menos 2 caracteres", "error");
      return;
    }

    if (trimmedName.length > 255) {
      showToast("El nombre no puede exceder 255 caracteres", "error");
      return;
    }

    if (!editingCategoryId) return;

    try {
      // API call
      await updateCategory(editingCategoryId, { name: trimmedName });
      showToast("Categoría actualizada correctamente", "success");

      // Revalidate from server
      await onUpdate?.();

      setEditingCategoryId(null);
      setEditName("");
    } catch (error) {
      console.error("Error updating category:", error);
      const errorMessage = getErrorMessage(
        error,
        "Error al actualizar la categoría"
      );
      showToast(errorMessage, "error");

      // Revert optimistic update
      await onUpdate?.();
    }
  };

  const handleCancelCategory = () => {
    setEditingCategoryId(null);
    setEditName("");
  };

  const handleDeleteCategory = (category: (typeof categories)[0]) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete || isDeleting) return;

    const isGlobalCategory = categoryToDelete.user_id === null;
    setIsDeleting(true);

    try {
      // Delete all provisions
      if (categoryToDelete.provisions.length > 0 && budgetId) {
        await Promise.all(
          categoryToDelete.provisions.map((provision) =>
            deleteProvision(budgetId.toString(), provision.id.toString())
          )
        );
      }

      // Only delete the category from database if it's a user category
      if (!isGlobalCategory) {
        await deleteCategory(categoryToDelete.id);
      }

      const provisionCount = categoryToDelete.provisions.length;
      let message;

      if (isGlobalCategory) {
        message =
          provisionCount > 0
            ? `${provisionCount} provisión(es) eliminadas correctamente`
            : "No hay provisiones para eliminar";
      } else {
        message =
          provisionCount > 0
            ? `Categoría y ${provisionCount} provisión(es) eliminadas correctamente`
            : "Categoría eliminada correctamente";
      }

      showToast(message, "success");

      // Revalidate from server
      await onUpdate?.();

      // Close dialog and reset state
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      setIsDeleting(false);
    } catch (error) {
      console.error("Error deleting category:", error);
      const errorMessage = getErrorMessage(
        error,
        "Error al eliminar la categoría"
      );
      showToast(errorMessage, "error");

      // Revalidate from server to restore correct state
      await onUpdate?.();

      // Keep dialog open so user can see the error and try again
      setIsDeleting(false);
    }
  };

  const handleEditProvision = (
    categoryId: number,
    provision: ProvisionItem,
    isNew = false
  ) => {
    setEditingProvisionId(provision.id);
    setEditName(provision.name);
    setEditAmount(provision.amount.toString());
    if (isNew) {
      setNewProvisionCategoryId(categoryId);
    } else {
      setNewProvisionCategoryId(null);
    }
  };

  const handleSaveProvision = async (categoryId: number) => {
    if (!editName.trim() || !editAmount.trim() || !budgetId) {
      return;
    }

    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    const isNewProvision = newProvisionCategoryId === categoryId;

    try {
      if (isNewProvision) {
        // Create new provision
        await createProvision(budgetId.toString(), {
          category_id: categoryId,
          name: editName,
          amount,
        });
      } else if (editingProvisionId) {
        // Update existing provision
        await updateProvision(
          budgetId.toString(),
          editingProvisionId.toString(),
          {
            category_id: categoryId,
            name: editName,
            amount,
          }
        );
      }

      // Refresh data from server
      await onUpdate?.();

      setEditingProvisionId(null);
      setEditName("");
      setEditAmount("");
      setNewProvisionCategoryId(null);
    } catch (error) {
      console.error("Error saving provision:", error);
      // Optionally show error to user
    }
  };

  const handleCancelProvision = () => {
    setEditingProvisionId(null);
    setEditName("");
    setEditAmount("");
    setNewProvisionCategoryId(null);
  };

  const handleDeleteProvision = async (
    categoryId: number,
    provisionId: number
  ) => {
    if (!budgetId) return;

    try {
      await deleteProvision(budgetId.toString(), provisionId.toString());

      // Refresh data from server
      await onUpdate?.();
    } catch (error) {
      console.error("Error deleting provision:", error);
      // Optionally show error to user
    }
  };

  const handleAddProvision = (categoryId: number) => {
    const newProvision: ProvisionItem = {
      id: Date.now(), // Temporary ID
      name: "",
      amount: 0,
    };

    handleEditProvision(categoryId, newProvision, true);
  };

  const handleAddCategory = () => {
    setCreateModalOpen(true);
  };

  const hasUserCategories = categories.some((cat) => cat.user_id !== null);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {!hasUserCategories && (
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No hay categorías personalizadas. Crea una nueva categoría.
          </Typography>
        </Box>
      )}

      {categories.map((category) => (
        <Box
          key={category.id}
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* Category Header */}
          <CategoryHeader
            category={category}
            isExpanded={expandedCategories.has(category.id)}
            isEditing={editingCategoryId === category.id}
            editName={editName}
            onNameChange={setEditName}
            onSave={handleSaveCategory}
            onCancel={handleCancelCategory}
            onEdit={() => handleEditCategory(category)}
            onDelete={() => handleDeleteCategory(category)}
            onToggle={() => toggleCategory(category.id)}
          />

          {/* Provisions List */}
          <Collapse in={expandedCategories.has(category.id)}>
            <ProvisionsList
              provisions={category.provisions}
              editingProvisionId={editingProvisionId}
              editName={editName}
              editAmount={editAmount}
              isNewProvision={newProvisionCategoryId === category.id}
              onNameChange={setEditName}
              onAmountChange={setEditAmount}
              onEditProvision={(provision) =>
                handleEditProvision(category.id, provision)
              }
              onSaveProvision={() => handleSaveProvision(category.id)}
              onCancelProvision={handleCancelProvision}
              onDeleteProvision={(provisionId) =>
                handleDeleteProvision(category.id, provisionId)
              }
              onAddProvision={() => handleAddProvision(category.id)}
            />
          </Collapse>
        </Box>
      ))}

      {/* Add Category Button */}
      <Button
        variant="outlined"
        startIcon={<AddCircleOutline />}
        onClick={handleAddCategory}
        fullWidth
        sx={{
          py: 1.5,
          borderRadius: 2,
          borderStyle: "dashed",
          "&:hover": { borderStyle: "dashed" },
        }}
      >
        Añadir categoría
      </Button>

      {/* Create Category Modal */}
      <CreateCategoryModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={async () => {
          await onUpdate?.();
        }}
      />

      {/* Delete Category Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title={
          categoryToDelete?.user_id === null
            ? "Eliminar provisiones"
            : "Eliminar categoría"
        }
        message={
          categoryToDelete
            ? categoryToDelete.user_id === null
              ? categoryToDelete.provisions.length > 0
                ? `Esta categoría global tiene ${categoryToDelete.provisions.length} provisión(es). ¿Deseas eliminar las provisiones de "${categoryToDelete.name}"? La categoría seguirá disponible.`
                : `Esta categoría "${categoryToDelete.name}" no tiene provisiones para eliminar.`
              : categoryToDelete.provisions.length > 0
              ? `Esta categoría tiene ${categoryToDelete.provisions.length} provisión(es) que se eliminarán. ¿Estás seguro de que deseas eliminar "${categoryToDelete.name}"?`
              : `¿Estás seguro de que deseas eliminar la categoría "${categoryToDelete.name}"?`
            : ""
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmColor="error"
        isLoading={isDeleting}
        onConfirm={confirmDeleteCategory}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
          }
        }}
      />
    </Box>
  );
}
