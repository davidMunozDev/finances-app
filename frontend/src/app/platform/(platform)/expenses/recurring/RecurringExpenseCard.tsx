import { Box, Typography, IconButton, Chip } from "@mui/material";
import { EditOutlined, DeleteOutline } from "@mui/icons-material";
import { useCurrency } from "@/hooks/useCurrency";
import { useLocale } from "@/hooks/useLocale";
import type { RecurringExpense } from "@/data/recurring-expenses/types";
import { formatFrequency, getNextPaymentDate } from "./utils";

interface RecurringExpenseCardProps {
  expense: RecurringExpense;
  categoryName?: string;
  onEdit: (expense: RecurringExpense) => void;
  onDelete: (expense: RecurringExpense) => void;
}

const FREQUENCY_COLORS = {
  weekly: "#2196F3", // Blue
  monthly: "#4CAF50", // Green
  yearly: "#9C27B0", // Purple
};

export default function RecurringExpenseCard({
  expense,
  categoryName,
  onEdit,
  onDelete,
}: RecurringExpenseCardProps) {
  const { formatCurrency } = useCurrency();
  const { formatDate } = useLocale();
  const nextPaymentDate = getNextPaymentDate(expense);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2.5,
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        "&:hover": {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.12)",
          "& .action-buttons": {
            opacity: 1,
          },
        },
        transition: "box-shadow 0.2s",
      }}
    >
      {/* Left section: Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            mb: 0.5,
          }}
        >
          {expense.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {categoryName || `Categoría ${expense.category_id}`}
        </Typography>
        <Chip
          label={formatFrequency(expense)}
          size="small"
          sx={{
            bgcolor: `${FREQUENCY_COLORS[expense.frequency]}15`,
            color: FREQUENCY_COLORS[expense.frequency],
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
      </Box>

      {/* Right section: Date, Amount and Actions */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 0.5,
          ml: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "primary.main",
            }}
          >
            {formatCurrency(expense.amount)}
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
            <IconButton
              size="small"
              onClick={() => onEdit(expense)}
              sx={{
                color: "primary.main",
                bgcolor: "primary.lighter",
                "&:hover": { bgcolor: "primary.light" },
              }}
            >
              <EditOutlined fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(expense)}
              sx={{
                color: "error.main",
                bgcolor: "error.lighter",
                "&:hover": { bgcolor: "error.light" },
              }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Próximo: {formatDate(nextPaymentDate.toISOString().split("T")[0])}
        </Typography>
      </Box>
    </Box>
  );
}
