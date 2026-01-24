import { useState, useCallback } from "react";
import { createWorker } from "tesseract.js";
import { scanReceipt } from "@/data/assistant/api";
import { ScanReceiptResponse } from "@/data/assistant/types";
import { useToast } from "@/hooks/useToast";

interface UseReceiptScannerResult {
  isScanning: boolean;
  progress: number;
  extractedText: string | null;
  scannedData: ScanReceiptResponse | null;
  error: string | null;
  scanImage: (file: File, budgetId: string) => Promise<void>;
  resetScanner: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function useReceiptScanner(): UseReceiptScannerResult {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<ScanReceiptResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const compressImage = useCallback(
    (file: File): Promise<Blob> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
          img.src = e.target?.result as string;
        };

        reader.onerror = () => {
          reject(new Error("Error al leer la imagen"));
        };

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("No se pudo crear el contexto del canvas"));
            return;
          }

          // Calculate new dimensions (max 800px width)
          const maxWidth = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and convert to grayscale with contrast enhancement
          ctx.drawImage(img, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;

          // Grayscale conversion and contrast enhancement
          for (let i = 0; i < data.length; i += 4) {
            const gray =
              0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            // Simple contrast enhancement
            const enhanced = gray < 128 ? gray * 0.8 : gray * 1.2;
            const final = Math.min(255, Math.max(0, enhanced));

            data[i] = final;
            data[i + 1] = final;
            data[i + 2] = final;
          }

          ctx.putImageData(imageData, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Error al comprimir la imagen"));
              }
            },
            "image/jpeg",
            0.85
          );
        };

        img.onerror = () => {
          reject(new Error("Error al cargar la imagen"));
        };

        reader.readAsDataURL(file);
      }),
    []
  );

  const performOCR = useCallback(async (imageBlob: Blob): Promise<string> => {
    const worker = await createWorker("spa", 1, {
      cacheMethod: "indexedDB",
      logger: (m) => {
        if (m.status === "recognizing text") {
          setProgress(Math.round(m.progress * 50)); // 0-50% for OCR
        }
      },
    });

    try {
      const {
        data: { text },
      } = await worker.recognize(imageBlob);
      await worker.terminate();
      return text;
    } catch (error) {
      await worker.terminate();
      throw error;
    }
  }, []);

  const scanImage = useCallback(
    async (file: File, budgetId: string) => {
      setIsScanning(true);
      setProgress(0);
      setError(null);
      setExtractedText(null);
      setScannedData(null);

      try {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(
            "La imagen es demasiado grande. El tamaño máximo es 5MB."
          );
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error("El archivo debe ser una imagen.");
        }

        // Compress image
        setProgress(5);
        const compressedBlob = await compressImage(file);

        // Perform OCR
        setProgress(10);
        const text = await performOCR(compressedBlob);

        if (!text || text.trim().length < 10) {
          throw new Error(
            "No se pudo detectar texto en la imagen. Intenta con otra foto más clara."
          );
        }

        setExtractedText(text);
        setProgress(60);

        // Process with AI
        const result = await scanReceipt(text, budgetId);
        setProgress(90);

        // Count populated fields
        const populatedFields = Object.values(result).filter(
          (value) => value !== null && value !== undefined
        ).length;

        if (populatedFields === 0) {
          showToast(
            "No se pudo extraer información del recibo. Intenta con otra foto.",
            "error"
          );
        } else if (populatedFields < 2) {
          showToast(
            `Solo se detectó ${populatedFields} campo. ¿Reintentar con otra foto?`,
            "warning"
          );
        } else {
          showToast(
            `${populatedFields} campos rellenados automáticamente`,
            "success"
          );
        }

        setScannedData(result);
        setProgress(100);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al procesar la imagen. Por favor, inténtalo de nuevo.";
        setError(errorMessage);
        showToast(errorMessage, "error");
      } finally {
        setIsScanning(false);
      }
    },
    [compressImage, performOCR, showToast]
  );

  const resetScanner = useCallback(() => {
    setIsScanning(false);
    setProgress(0);
    setExtractedText(null);
    setScannedData(null);
    setError(null);
  }, []);

  return {
    isScanning,
    progress,
    extractedText,
    scannedData,
    error,
    scanImage,
    resetScanner,
  };
}
