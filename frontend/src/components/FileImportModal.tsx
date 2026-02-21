"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  IconButton,
  Typography,
  LinearProgress,
  useMediaQuery,
  useTheme,
  Checkbox,
  Chip,
  TextField,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
} from "@mui/material";
import { Close, UploadFile, Description } from "@mui/icons-material";
import { useRef, useCallback, useMemo } from "react";
import {
  useFileImporter,
  type EditableTransaction,
} from "@/hooks/useFileImporter";
import type { Category } from "@/data/categories/types";

interface FileImportModalProps {
  open: boolean;
  onClose: () => void;
  budgetId: string;
  categories: Category[];
  onImportComplete: () => void;
}

export default function FileImportModal({
  open,
  onClose,
  budgetId,
  categories,
  onImportComplete,
}: FileImportModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isProcessing,
    isSaving,
    progress,
    transactions,
    error,
    fileName,
    processFile,
    saveTransactions,
    updateTransaction,
    toggleTransaction,
    toggleAll,
    reset,
  } = useFileImporter();

  // Build a lowercase category name → id map
  const categoryMap = useMemo(() => {
    const map: Record<string, number> = {};
    categories.forEach((c) => {
      map[c.name.toLowerCase()] = c.id;
    });
    return map;
  }, [categories]);

  const allSelected =
    transactions.length > 0 && transactions.every((t) => t.selected);
  const someSelected = transactions.some((t) => t.selected);
  const selectedCount = transactions.filter((t) => t.selected).length;

  const selectedExpenses = transactions.filter(
    (t) => t.selected && t.type === "expense",
  );
  const selectedIncomes = transactions.filter(
    (t) => t.selected && t.type === "income",
  );
  const totalExpenses = selectedExpenses.reduce((s, t) => s + t.amount, 0);
  const totalIncomes = selectedIncomes.reduce((s, t) => s + t.amount, 0);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file) return;
      await processFile(file, budgetId);
    },
    [budgetId, processFile],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    const success = await saveTransactions(budgetId, transactions, categoryMap);
    if (success) {
      onImportComplete();
      handleModalClose();
    }
  };

  const handleModalClose = () => {
    if (!isProcessing && !isSaving) {
      reset();
      onClose();
    }
  };

  const handleCategoryChange = (tx: EditableTransaction, value: string) => {
    updateTransaction(tx.id, { category: value || null });
  };

  const handleTypeChange = (
    tx: EditableTransaction,
    value: "income" | "expense",
  ) => {
    updateTransaction(tx.id, { type: value });
  };

  const handleAmountChange = (tx: EditableTransaction, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      updateTransaction(tx.id, { amount: Math.round(num * 100) / 100 });
    }
  };

  const handleDescriptionChange = (tx: EditableTransaction, value: string) => {
    updateTransaction(tx.id, { description: value });
  };

  const handleDateChange = (tx: EditableTransaction, value: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      updateTransaction(tx.id, { date: value });
    }
  };

  const showUploadStep =
    !fileName && !isProcessing && transactions.length === 0;
  const showProcessingStep = isProcessing;
  const showPreviewStep = !isProcessing && transactions.length > 0 && !error;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.pdf"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />

      <Dialog
        open={open}
        onClose={!isProcessing && !isSaving ? handleModalClose : undefined}
        fullScreen={isMobile}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            bgcolor: "background.default",
            maxHeight: isMobile ? "100%" : "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Importar Transacciones
          </Typography>
          <IconButton
            onClick={handleModalClose}
            disabled={isProcessing || isSaving}
            sx={{ color: "text.secondary" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Step 1: Upload */}
          {showUploadStep && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
                py: 6,
              }}
            >
              <UploadFile sx={{ fontSize: 64, color: "text.secondary" }} />
              <Typography variant="h6" color="text.secondary">
                Selecciona un archivo CSV o PDF
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Extractos bancarios, de tarjeta de crédito u otros documentos
                con transacciones de gastos e ingresos
              </Typography>

              <Button
                variant="contained"
                startIcon={<Description />}
                onClick={handleUploadClick}
                sx={{
                  mt: 2,
                  py: 1.5,
                  px: 4,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                Seleccionar Archivo
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
                sx={{ mt: 1 }}
              >
                Tamaño máximo: 2MB &bull; Formatos: CSV, PDF
              </Typography>

              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
            </Box>
          )}

          {/* Step 2: Processing */}
          {showProcessingStep && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
                py: 6,
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Procesando {fileName}...
              </Typography>
              <Box sx={{ width: "100%", maxWidth: 400 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ borderRadius: 1, height: 8 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {progress < 30
                  ? "Extrayendo contenido del archivo..."
                  : progress < 80
                    ? "Analizando transacciones con IA..."
                    : "Finalizando..."}
              </Typography>
            </Box>
          )}

          {/* Error after processing */}
          {!isProcessing && error && transactions.length === 0 && fileName && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
                py: 6,
              }}
            >
              <Typography color="error" variant="body1">
                {error}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  reset();
                }}
                sx={{ textTransform: "none" }}
              >
                Intentar con otro archivo
              </Button>
            </Box>
          )}

          {/* Step 3: Preview & Edit */}
          {showPreviewStep && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Summary bar */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {selectedCount} de {transactions.length} transacciones
                  seleccionadas
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {selectedExpenses.length > 0 && (
                    <Chip
                      label={`${selectedExpenses.length} gastos: ${totalExpenses.toFixed(2)} €`}
                      color="error"
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {selectedIncomes.length > 0 && (
                    <Chip
                      label={`${selectedIncomes.length} ingresos: ${totalIncomes.toFixed(2)} €`}
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>

              {/* Re-upload button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  startIcon={<UploadFile />}
                  onClick={handleUploadClick}
                  sx={{ textTransform: "none" }}
                >
                  Cambiar archivo
                </Button>
              </Box>

              {/* Editable table */}
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ maxHeight: isMobile ? 400 : 500 }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={allSelected}
                          indeterminate={someSelected && !allSelected}
                          onChange={(e) => toggleAll(e.target.checked)}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 90 }}>Tipo</TableCell>
                      <TableCell sx={{ minWidth: 110 }}>Fecha</TableCell>
                      <TableCell sx={{ minWidth: 180 }}>Descripción</TableCell>
                      <TableCell sx={{ minWidth: 130 }}>Categoría</TableCell>
                      <TableCell sx={{ minWidth: 100 }} align="right">
                        Importe
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow
                        key={tx.id}
                        sx={{
                          opacity: tx.selected ? 1 : 0.5,
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={tx.selected}
                            onChange={() => toggleTransaction(tx.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={tx.type}
                              onChange={(e) =>
                                handleTypeChange(
                                  tx,
                                  e.target.value as "income" | "expense",
                                )
                              }
                              variant="standard"
                              sx={{ fontSize: "0.8rem" }}
                            >
                              <MenuItem value="expense">
                                <Chip
                                  label="Gasto"
                                  color="error"
                                  size="small"
                                  sx={{ height: 22, fontSize: "0.75rem" }}
                                />
                              </MenuItem>
                              <MenuItem value="income">
                                <Chip
                                  label="Ingreso"
                                  color="success"
                                  size="small"
                                  sx={{ height: 22, fontSize: "0.75rem" }}
                                />
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="date"
                            value={tx.date}
                            onChange={(e) =>
                              handleDateChange(tx, e.target.value)
                            }
                            variant="standard"
                            size="small"
                            sx={{ fontSize: "0.8rem" }}
                            slotProps={{
                              input: { sx: { fontSize: "0.8rem" } },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={tx.description}
                            onChange={(e) =>
                              handleDescriptionChange(tx, e.target.value)
                            }
                            variant="standard"
                            size="small"
                            fullWidth
                            slotProps={{
                              input: { sx: { fontSize: "0.8rem" } },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={tx.category ?? ""}
                              onChange={(e) =>
                                handleCategoryChange(tx, e.target.value)
                              }
                              variant="standard"
                              displayEmpty
                              sx={{ fontSize: "0.8rem" }}
                            >
                              <MenuItem value="">
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ fontSize: "0.8rem" }}
                                >
                                  Sin categoría
                                </Typography>
                              </MenuItem>
                              {categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.name}>
                                  {cat.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            value={tx.amount}
                            onChange={(e) =>
                              handleAmountChange(tx, e.target.value)
                            }
                            variant="standard"
                            size="small"
                            slotProps={{
                              input: {
                                sx: {
                                  fontSize: "0.8rem",
                                  textAlign: "right",
                                  fontWeight: 600,
                                  color:
                                    tx.type === "expense"
                                      ? "error.main"
                                      : "success.main",
                                },
                                inputProps: { min: 0.01, step: 0.01 },
                              },
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: 1,
            borderColor: "divider",
            p: 2,
            gap: 1,
          }}
        >
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={handleModalClose}
            disabled={isProcessing || isSaving}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>

          {showPreviewStep && (
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={isSaving || !someSelected}
              sx={{
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {isSaving
                ? "Importando..."
                : `Importar ${selectedCount} transacciones`}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
