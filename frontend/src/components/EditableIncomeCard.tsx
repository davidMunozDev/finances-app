"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Divider,
} from "@mui/material";
import {
  AddCircleOutline,
  EditOutlined,
  DeleteOutline,
  CheckOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import { useCurrency } from "@/hooks/useCurrency";
import { createIncome, updateIncome, deleteIncome } from "@/data/incomes/api";

export interface IncomeItem {
  id: number;
  description: string;
  amount: number;
}

interface EditableIncomeCardProps {
  title: string;
  incomes: IncomeItem[];
  onUpdate?: () => void | Promise<void>;
  budgetId: number | null;
}

export default function EditableIncomeCard({
  title,
  incomes: initialIncomes,
  onUpdate,
  budgetId,
}: EditableIncomeCardProps) {
  const { formatCurrency } = useCurrency();
  const [incomes, setIncomes] = useState<IncomeItem[]>(initialIncomes);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [isNewItem, setIsNewItem] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    setIncomes(initialIncomes);
  }, [initialIncomes]);

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  const handleEdit = (income: IncomeItem, isNew = false) => {
    setEditingId(income.id);
    setEditName(income.description);
    setEditAmount(income.amount.toString());
    setIsNewItem(isNew);
  };

  const handleSave = async () => {
    if (!editName.trim() || !editAmount.trim() || !budgetId) {
      return;
    }

    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    try {
      if (isNewItem) {
        // Create new income
        await createIncome(budgetId.toString(), {
          amount,
          description: editName,
        });
      } else if (editingId) {
        // Update existing income
        await updateIncome(budgetId.toString(), editingId.toString(), {
          amount,
          description: editName,
        });
      }

      // Refresh data from server
      await onUpdate?.();

      setEditingId(null);
      setEditName("");
      setEditAmount("");
      setIsNewItem(false);
    } catch (error) {
      console.error("Error saving income:", error);
      // Optionally show error to user
    }
  };

  const handleCancel = () => {
    if (isNewItem) {
      // Remove the temporary new item
      const updatedIncomes = incomes.filter(
        (income) => income.id !== editingId
      );
      setIncomes(updatedIncomes);
    }
    setEditingId(null);
    setEditName("");
    setEditAmount("");
    setIsNewItem(false);
  };

  const handleDelete = async (id: number) => {
    if (!budgetId) return;

    try {
      await deleteIncome(budgetId.toString(), id.toString());

      // Refresh data from server
      await onUpdate?.();
    } catch (error) {
      console.error("Error deleting income:", error);
      // Optionally show error to user
    }
  };

  const handleAdd = () => {
    const newIncome: IncomeItem = {
      id: Date.now(), // Temporary ID
      description: "",
      amount: 0,
    };
    const updatedIncomes = [...incomes, newIncome];
    setIncomes(updatedIncomes);
    handleEdit(newIncome, true);
  };

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2,
        p: 3,
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="h6" fontWeight={700} color="success.main">
          {formatCurrency(totalIncome)}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Income List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {incomes.map((income) => (
          <Box key={income.id}>
            {editingId === income.id ? (
              // Edit Mode
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "flex-start",
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nombre"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                    },
                  }}
                />
                <TextField
                  size="small"
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="Cantidad"
                  sx={{
                    width: { xs: "100%", sm: 150 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                    },
                  }}
                />
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={handleSave}
                    sx={{
                      color: "success.main",
                      bgcolor: "success.lighter",
                      "&:hover": { bgcolor: "success.light" },
                    }}
                  >
                    <CheckOutlined fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleCancel}
                    sx={{
                      color: "error.main",
                      bgcolor: "error.lighter",
                      "&:hover": { bgcolor: "error.light" },
                    }}
                  >
                    <CloseOutlined fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              // View Mode
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1,
                  px: 1.5,
                  borderRadius: 1.5,
                  "&:hover": {
                    bgcolor: "action.hover",
                    "& .action-buttons": {
                      opacity: 1,
                    },
                  },
                }}
              >
                <Typography variant="body1">{income.description}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    {formatCurrency(income.amount)}
                  </Typography>
                  <Box
                    className="action-buttons"
                    sx={{
                      display: "flex",
                      gap: 0.5,
                      opacity: { xs: 1, sm: 0 },
                      transition: "opacity 0.2s",
                    }}
                  >
                    <IconButton size="small" onClick={() => handleEdit(income)}>
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(income.id)}
                      sx={{ color: "error.main" }}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Add Button */}
      <Button
        variant="outlined"
        startIcon={<AddCircleOutline />}
        onClick={handleAdd}
        fullWidth
        sx={{
          mt: 2,
          py: 1.5,
          borderRadius: 2,
          borderStyle: "dashed",
          "&:hover": { borderStyle: "dashed" },
        }}
      >
        Añadir ingreso
      </Button>
    </Box>
  );
}
