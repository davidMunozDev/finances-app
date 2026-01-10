import { Box, Typography, IconButton } from "@mui/material";
import {
  EditOutlined,
  DeleteOutline,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { useCurrency } from "@/hooks/useCurrency";
import { CategoryWithProvisions } from "./types";
import { getCategoryTotal } from "./utils";
import EditCategoryForm from "./EditCategoryForm";

interface CategoryHeaderProps {
  category: CategoryWithProvisions;
  isExpanded: boolean;
  isEditing: boolean;
  editName: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

export default function CategoryHeader({
  category,
  isExpanded,
  isEditing,
  editName,
  onNameChange,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  onToggle,
}: CategoryHeaderProps) {
  const { formatCurrency } = useCurrency();

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
      onClick={() => !isEditing && onToggle()}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
        {/* Color Indicator */}
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: 0.5,
            bgcolor: category.color,
            flexShrink: 0,
          }}
        />

        {isEditing ? (
          <EditCategoryForm
            editName={editName}
            onNameChange={onNameChange}
            onSave={onSave}
            onCancel={onCancel}
          />
        ) : (
          <>
            <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
              {category.name.length > 20
                ? `${category.name.substring(0, 20)}...`
                : category.name}
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {formatCurrency(getCategoryTotal(category))}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                ml: 1,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {category.user_id !== null && (
                <IconButton size="small" onClick={onEdit}>
                  <EditOutlined fontSize="small" />
                </IconButton>
              )}
              {(category.user_id !== null ||
                category.provisions.length > 0) && (
                <IconButton
                  size="small"
                  onClick={onDelete}
                  sx={{ color: "error.main" }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              )}
              <IconButton size="small" onClick={onToggle}>
                {isExpanded ? (
                  <ExpandLess fontSize="small" />
                ) : (
                  <ExpandMore fontSize="small" />
                )}
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
