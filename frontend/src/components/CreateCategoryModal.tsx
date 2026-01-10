"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { createCategory } from "@/data/categories/api";
import { useToast } from "@/hooks/useToast";

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error && typeof error === "object" && "response" in error) {
    const apiError = error as ApiErrorResponse;
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
  }
  return defaultMessage;
}

interface CreateCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export default function CreateCategoryModal({
  open,
  onClose,
  onSuccess,
}: CreateCategoryModalProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleClose = () => {
    if (!isSubmitting) {
      setName("");
      onClose();
    }
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();

    // Client-side validation
    if (trimmedName.length < 2) {
      showToast("El nombre debe tener al menos 2 caracteres", "error");
      return;
    }

    if (trimmedName.length > 25) {
      showToast("El nombre no puede exceder 25 caracteres", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCategory({ name: trimmedName });
      showToast("Categoría creada correctamente", "success");
      setName("");
      await onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating category:", error);
      const errorMessage = getErrorMessage(
        error,
        "Error al crear la categoría"
      );
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Añadir categoría</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            autoFocus
            fullWidth
            label="Nombre de la categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isSubmitting) {
                handleSubmit();
              }
            }}
            placeholder="Ej: Transporte, Comida..."
            disabled={isSubmitting}
            inputProps={{ maxLength: 25 }}
            helperText={`${name.length}/25 caracteres`}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || name.trim().length < 2}
        >
          {isSubmitting ? "Creando..." : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
