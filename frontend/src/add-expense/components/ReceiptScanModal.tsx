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
} from "@mui/material";
import {
  Close,
  CameraAlt,
  Upload,
  Refresh,
  CheckCircle,
} from "@mui/icons-material";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useReceiptScanner } from "../hooks/useReceiptScanner";
import { ScanReceiptResponse } from "@/data/assistant/types";

interface ReceiptScanModalProps {
  open: boolean;
  onClose: () => void;
  budgetId: string;
  onScanComplete: (data: ScanReceiptResponse) => void;
}

export default function ReceiptScanModal({
  open,
  onClose,
  budgetId,
  onScanComplete,
}: ReceiptScanModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const {
    isScanning,
    progress,
    extractedText,
    scannedData,
    scanImage,
    resetScanner,
  } = useReceiptScanner();

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file) return;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Scan image
      await scanImage(file, budgetId);
    },
    [budgetId, scanImage]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRetry = () => {
    resetScanner();
    setPreview(null);
    if (isMobile) {
      handleCameraCapture();
    } else {
      handleFileUpload();
    }
  };

  const handleComplete = () => {
    if (scannedData) {
      onScanComplete(scannedData);
      handleModalClose();
    }
  };

  const handleModalClose = () => {
    resetScanner();
    setPreview(null);
    onClose();
  };

  const showRetryButton =
    scannedData &&
    Object.values(scannedData).filter((v) => v !== null && v !== undefined)
      .length < 2;

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />

      <Dialog
        open={open}
        onClose={!isScanning ? handleModalClose : undefined}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            bgcolor: "background.default",
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
            Escanear Recibo
          </Typography>
          <IconButton
            onClick={handleModalClose}
            disabled={isScanning}
            sx={{ color: "text.secondary" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {!preview && !isScanning && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
                py: 4,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Selecciona cómo quieres capturar el recibo
              </Typography>

              {isMobile && (
                <Button
                  variant="contained"
                  startIcon={<CameraAlt />}
                  onClick={handleCameraCapture}
                  fullWidth
                  sx={{
                    py: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  Tomar Foto
                </Button>
              )}

              <Button
                variant={isMobile ? "outlined" : "contained"}
                startIcon={<Upload />}
                onClick={handleFileUpload}
                fullWidth
                sx={{
                  py: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                Subir Imagen
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
                sx={{ mt: 2 }}
              >
                Tamaño máximo: 5MB
                <br />
                Formatos: JPG, PNG
              </Typography>
            </Box>
          )}

          {preview && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Image Preview */}
              <Box
                sx={{
                  width: "100%",
                  height: 300,
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                }}
              >
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </Box>

              {/* Progress Bar */}
              {isScanning && (
                <Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ borderRadius: 1, height: 8 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block", textAlign: "center" }}
                  >
                    {progress < 50
                      ? "Procesando imagen..."
                      : progress < 90
                      ? "Analizando con IA..."
                      : "Finalizando..."}
                  </Typography>
                </Box>
              )}

              {/* Extracted Text Preview */}
              {extractedText && !isScanning && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, mb: 1, display: "block" }}
                  >
                    Texto extraído:
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: 150,
                      overflow: "auto",
                      bgcolor: "background.paper",
                      p: 2,
                      borderRadius: 1,
                      border: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "monospace",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {extractedText}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Success message */}
              {scannedData && !isScanning && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 2,
                    bgcolor: "success.light",
                    borderRadius: 1,
                  }}
                >
                  <CheckCircle sx={{ color: "success.main" }} />
                  <Typography variant="body2" sx={{ color: "success.dark" }}>
                    {
                      Object.values(scannedData).filter(
                        (v) => v !== null && v !== undefined
                      ).length
                    }{" "}
                    campos detectados correctamente
                  </Typography>
                </Box>
              )}
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
          {showRetryButton && (
            <Button
              onClick={handleRetry}
              startIcon={<Refresh />}
              sx={{ textTransform: "none" }}
            >
              Reintentar
            </Button>
          )}

          <Box sx={{ flex: 1 }} />

          <Button
            onClick={handleModalClose}
            disabled={isScanning}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>

          {scannedData && !isScanning && (
            <Button
              onClick={handleComplete}
              variant="contained"
              sx={{
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Usar Datos
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
