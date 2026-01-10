import { Box, Typography, IconButton } from "@mui/material";
import { EditOutlined, DeleteOutline } from "@mui/icons-material";
import { useCurrency } from "@/hooks/useCurrency";
import { ProvisionItem } from "./types";

interface ProvisionItemViewProps {
  provision: ProvisionItem;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProvisionItemView({
  provision,
  onEdit,
  onDelete,
}: ProvisionItemViewProps) {
  const { formatCurrency } = useCurrency();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1,
        pl: 4,
        pr: 1.5,
        borderRadius: 1.5,
        "&:hover": {
          bgcolor: "action.hover",
          "& .action-buttons": {
            opacity: 1,
          },
        },
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {provision.name}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" fontWeight={600}>
          {formatCurrency(provision.amount)}
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
          <IconButton size="small" onClick={onEdit}>
            <EditOutlined fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={onDelete}
            sx={{ color: "error.main" }}
          >
            <DeleteOutline fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
