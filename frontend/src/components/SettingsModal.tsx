"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Close,
  AccountCircleOutlined,
  DeleteOutlined,
  CurrencyExchangeOutlined,
  LogoutOutlined,
} from "@mui/icons-material";
import { logoutUser, deleteUserAccount } from "@/data/auth/api";
import { useState } from "react";

interface SettingsItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isDanger?: boolean;
}

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
      onClose();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteUserAccount();
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Configuración de los items del menú de settings
  const settingsItems: SettingsItem[] = [
    {
      id: "modify-account",
      label: "Modificar cuenta",
      icon: <AccountCircleOutlined />,
      onClick: () => {
        // TODO: Implementar navegación o modal para modificar cuenta
        console.log("Modificar cuenta");
        onClose();
      },
    },
    {
      id: "change-currency",
      label: "Cambiar moneda",
      icon: <CurrencyExchangeOutlined />,
      onClick: () => {
        // TODO: Implementar navegación o modal para cambiar moneda
        console.log("Cambiar moneda");
        onClose();
      },
    },
    {
      id: "delete-account",
      label: "Eliminar cuenta",
      icon: <DeleteOutlined />,
      onClick: () => {
        setShowDeleteConfirm(true);
      },
      isDanger: true,
    },
    {
      id: "logout",
      label: "Cerrar sesión",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      isDanger: true,
    },
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 500,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Configuración
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
            disabled={isLoggingOut}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 0, py: 0 }}>
          <List sx={{ py: 0 }}>
            {settingsItems.map((item, index) => (
              <Box key={item.id}>
                {index > 0 && <Divider />}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={item.onClick}
                    disabled={isLoggingOut}
                    sx={{
                      py: 2,
                      px: 3,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: item.isDanger ? "error.main" : "primary.main",
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: 500,
                        color: item.isDanger ? "error.main" : "text.primary",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Box>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => !isDeleting && setShowDeleteConfirm(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            ¿Eliminar cuenta?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Esta acción no se puede deshacer. Se eliminarán todos tus datos de
            forma permanente.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
            sx={{ color: "text.secondary" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={isDeleting}
            autoFocus
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
