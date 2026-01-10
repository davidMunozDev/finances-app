import { Box, Button, Divider } from "@mui/material";
import { AddCircleOutline } from "@mui/icons-material";
import { ProvisionItem } from "./types";
import ProvisionItemView from "./ProvisionItem";
import EditProvisionForm from "./EditProvisionForm";

interface ProvisionsListProps {
  provisions: ProvisionItem[];
  editingProvisionId: number | null;
  editName: string;
  editAmount: string;
  onNameChange: (name: string) => void;
  onAmountChange: (amount: string) => void;
  onEditProvision: (provision: ProvisionItem) => void;
  onSaveProvision: () => void;
  onCancelProvision: () => void;
  onDeleteProvision: (provisionId: number) => void;
  onAddProvision: () => void;
}

export default function ProvisionsList({
  provisions,
  editingProvisionId,
  editName,
  editAmount,
  onNameChange,
  onAmountChange,
  onEditProvision,
  onSaveProvision,
  onCancelProvision,
  onDeleteProvision,
  onAddProvision,
}: ProvisionsListProps) {
  return (
    <Box sx={{ px: 2, pb: 2 }}>
      <Divider sx={{ mb: 1.5 }} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {provisions.map((provision) => (
          <Box key={provision.id}>
            {editingProvisionId === provision.id ? (
              <EditProvisionForm
                editName={editName}
                editAmount={editAmount}
                onNameChange={onNameChange}
                onAmountChange={onAmountChange}
                onSave={onSaveProvision}
                onCancel={onCancelProvision}
              />
            ) : (
              <ProvisionItemView
                provision={provision}
                onEdit={() => onEditProvision(provision)}
                onDelete={() => onDeleteProvision(provision.id)}
              />
            )}
          </Box>
        ))}
      </Box>

      {/* Add Provision Button */}
      <Button
        variant="outlined"
        size="small"
        startIcon={<AddCircleOutline />}
        onClick={onAddProvision}
        fullWidth
        sx={{
          mt: 1.5,
          py: 1,
          borderRadius: 1.5,
          borderStyle: "dashed",
          "&:hover": { borderStyle: "dashed" },
        }}
      >
        Añadir provisión
      </Button>
    </Box>
  );
}
