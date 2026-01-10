import { Box, TextField, IconButton } from "@mui/material";
import { CheckOutlined, CloseOutlined } from "@mui/icons-material";

interface EditProvisionFormProps {
  editName: string;
  editAmount: string;
  onNameChange: (name: string) => void;
  onAmountChange: (amount: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function EditProvisionForm({
  editName,
  editAmount,
  onNameChange,
  onAmountChange,
  onSave,
  onCancel,
}: EditProvisionFormProps) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "flex-start",
        pl: 4,
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <TextField
        fullWidth
        size="small"
        value={editName}
        onChange={(e) => onNameChange(e.target.value)}
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
        onChange={(e) => onAmountChange(e.target.value)}
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
    </Box>
  );
}
