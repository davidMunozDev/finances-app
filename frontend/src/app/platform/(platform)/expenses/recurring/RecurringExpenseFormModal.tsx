import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Autocomplete,
} from "@mui/material";
import type {
  RecurringExpense,
  CreateRecurringExpenseBody,
} from "@/data/recurring-expenses/types";
import type { Category } from "@/data/categories/types";
import { validateRecurringFields } from "./utils";

interface RecurringExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRecurringExpenseBody) => Promise<void>;
  categories: Category[];
  expense?: RecurringExpense | null;
}

export default function RecurringExpenseFormModal({
  open,
  onClose,
  onSubmit,
  categories,
  expense,
}: RecurringExpenseFormModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "yearly">(
    "monthly"
  );
  const [dow, setDow] = useState("1");
  const [dom, setDom] = useState("1");
  const [month, setMonth] = useState("1");
  const [day, setDay] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!expense;

  // Populate form when editing
  useEffect(() => {
    if (expense) {
      setName(expense.name);
      setAmount(expense.amount.toString());
      setCategoryId(expense.category_id);
      setFrequency(expense.frequency);
      if (expense.dow) setDow(expense.dow.toString());
      if (expense.dom) setDom(expense.dom.toString());
      if (expense.month) setMonth(expense.month.toString());
      if (expense.day) setDay(expense.day.toString());
    } else {
      // Reset form for create mode
      setName("");
      setAmount("");
      setCategoryId(null);
      setFrequency("monthly");
      setDow("1");
      setDom("1");
      setMonth("1");
      setDay("1");
    }
    setError("");
  }, [expense, open]);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    setError("");

    // Validate name
    if (name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    if (name.trim().length > 255) {
      setError("El nombre no puede exceder 255 caracteres");
      return;
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    // Validate category
    if (!categoryId) {
      setError("Debe seleccionar una categoría");
      return;
    }

    // Build data based on frequency
    let data: CreateRecurringExpenseBody;

    if (frequency === "weekly") {
      const dowNum = parseInt(dow);
      const validation = validateRecurringFields({ frequency, dow: dowNum });
      if (!validation.valid) {
        setError(validation.error || "Error de validación");
        return;
      }
      data = {
        category_id: categoryId,
        name: name.trim(),
        amount: amountNum,
        frequency: "weekly",
        dow: dowNum,
      };
    } else if (frequency === "monthly") {
      const domNum = parseInt(dom);
      const validation = validateRecurringFields({ frequency, dom: domNum });
      if (!validation.valid) {
        setError(validation.error || "Error de validación");
        return;
      }
      data = {
        category_id: categoryId,
        name: name.trim(),
        amount: amountNum,
        frequency: "monthly",
        dom: domNum,
      };
    } else {
      const monthNum = parseInt(month);
      const dayNum = parseInt(day);
      const validation = validateRecurringFields({
        frequency,
        month: monthNum,
        day: dayNum,
      });
      if (!validation.valid) {
        setError(validation.error || "Error de validación");
        return;
      }
      data = {
        category_id: categoryId,
        name: name.trim(),
        amount: amountNum,
        frequency: "yearly",
        month: monthNum,
        day: dayNum,
      };
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data);
      handleClose();
    } catch {
      setError("Error al guardar el gasto recurrente");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={600}>
          {isEditMode ? "Editar gasto recurrente" : "Crear gasto recurrente"}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {/* Name */}
          <TextField
            fullWidth
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Netflix, Gimnasio..."
            disabled={isSubmitting}
            inputProps={{ maxLength: 255 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {/* Amount */}
          <TextField
            fullWidth
            label="Cantidad"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={isSubmitting}
            inputProps={{ min: 0.01, step: 0.01 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {/* Category */}
          <Box>
            <Typography
              component="label"
              sx={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "medium",
                color: "text.primary",
                mb: 0.75,
              }}
            >
              Categoría
            </Typography>
            <Autocomplete
              value={categories.find((c) => c.id === categoryId) || null}
              onChange={(_, newValue: Category | null) => {
                setCategoryId(newValue?.id || null);
              }}
              options={categories}
              getOptionLabel={(option) => option.name}
              disabled={isSubmitting}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Selecciona una categoría"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              )}
            />
          </Box>

          {/* Frequency */}
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
              Frecuencia
            </FormLabel>
            <RadioGroup
              value={frequency}
              onChange={(e) =>
                setFrequency(e.target.value as "weekly" | "monthly" | "yearly")
              }
            >
              <FormControlLabel
                value="weekly"
                control={<Radio />}
                label="Semanal"
                disabled={isSubmitting}
              />
              <FormControlLabel
                value="monthly"
                control={<Radio />}
                label="Mensual"
                disabled={isSubmitting}
              />
              <FormControlLabel
                value="yearly"
                control={<Radio />}
                label="Anual"
                disabled={isSubmitting}
              />
            </RadioGroup>
          </FormControl>

          {/* Frequency-specific fields */}
          {frequency === "weekly" && (
            <TextField
              fullWidth
              label="Día de la semana (1=Lun, 7=Dom)"
              type="number"
              value={dow}
              onChange={(e) => setDow(e.target.value)}
              disabled={isSubmitting}
              inputProps={{ min: 1, max: 7 }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          )}

          {frequency === "monthly" && (
            <TextField
              fullWidth
              label="Día del mes (1-28)"
              type="number"
              value={dom}
              onChange={(e) => setDom(e.target.value)}
              disabled={isSubmitting}
              inputProps={{ min: 1, max: 28 }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          )}

          {frequency === "yearly" && (
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Mes (1-12)"
                type="number"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                disabled={isSubmitting}
                inputProps={{ min: 1, max: 12 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                fullWidth
                label="Día (1-31)"
                type="number"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                disabled={isSubmitting}
                inputProps={{ min: 1, max: 31 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}

          {/* Error message */}
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: -1 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            px: 3,
          }}
        >
          {isSubmitting ? "Guardando..." : isEditMode ? "Actualizar" : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
