import { Box, TextField, IconButton } from "@mui/material";
import { CheckOutlined, CloseOutlined } from "@mui/icons-material";

interface EditCategoryFormProps {
  editName: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function EditCategoryForm({
  editName,
  onNameChange,
  onSave,
  onCancel,
}: EditCategoryFormProps) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        flex: 1,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <TextField
        fullWidth
        size="small"
        value={editName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Nombre de categoría"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 1.5,
          },
        }}
      />
      <IconButton
        size="small"
        onClick={onSave}
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
        onClick={onCancel}
        sx={{
          color: "error.main",
          bgcolor: "error.lighter",
          "&:hover": { bgcolor: "error.light" },
        }}
      >
        <CloseOutlined fontSize="small" />
      </IconButton>
    </Box>
  );
}
