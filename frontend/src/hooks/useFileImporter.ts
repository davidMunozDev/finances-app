import { useState, useCallback } from "react";
import { processFileContent, bulkImportTransactions } from "@/data/import/api";
import type { ExtractedTransaction, BulkImportItem } from "@/data/import/types";
import { useToast } from "@/hooks/useToast";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export interface EditableTransaction extends ExtractedTransaction {
  id: string; // Temporary client-side ID
  selected: boolean;
}

export interface UseFileImporterResult {
  isProcessing: boolean;
  isSaving: boolean;
  progress: number;
  transactions: EditableTransaction[];
  error: string | null;
  fileName: string | null;
  processFile: (file: File, budgetId: string) => Promise<void>;
  saveTransactions: (
    budgetId: string,
    transactions: EditableTransaction[],
    categoryMap: Record<string, number>,
  ) => Promise<boolean>;
  updateTransaction: (
    id: string,
    updates: Partial<EditableTransaction>,
  ) => void;
  toggleTransaction: (id: string) => void;
  toggleAll: (selected: boolean) => void;
  reset: () => void;
}

export function useFileImporter(): UseFileImporterResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transactions, setTransactions] = useState<EditableTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { showToast } = useToast();

  const readFileAsBase64 = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // Remove the "data:application/pdf;base64," prefix
        const base64 = dataUrl.split(",")[1];
        if (!base64) {
          reject(new Error("No se pudo leer el archivo PDF"));
          return;
        }
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Error al leer el archivo PDF"));
      reader.readAsDataURL(file);
    });
  }, []);

  const extractTextFromCSV = useCallback(
    async (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (!text || text.trim().length < 10) {
            reject(new Error("El archivo CSV está vacío o no contiene datos"));
            return;
          }
          resolve(text);
        };
        reader.onerror = () =>
          reject(new Error("Error al leer el archivo CSV"));
        reader.readAsText(file);
      });
    },
    [],
  );

  const processFile = useCallback(
    async (file: File, budgetId: string) => {
      setIsProcessing(true);
      setProgress(0);
      setError(null);
      setTransactions([]);
      setFileName(file.name);

      try {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(
            "El archivo es demasiado grande. El tamaño máximo es 2MB.",
          );
        }

        // Determine format
        const extension = file.name.toLowerCase().split(".").pop();
        let format: "csv" | "pdf";
        let content: string;

        if (extension === "csv" || file.type === "text/csv") {
          format = "csv";
          setProgress(10);
          content = await extractTextFromCSV(file);
          setProgress(30);
        } else if (extension === "pdf" || file.type === "application/pdf") {
          format = "pdf";
          setProgress(10);
          content = await readFileAsBase64(file);
          setProgress(30);
        } else {
          throw new Error(
            "Formato de archivo no soportado. Usa archivos CSV o PDF.",
          );
        }

        if (!content || (format === "csv" && content.trim().length < 10)) {
          throw new Error(
            "No se pudo extraer contenido del archivo. Verifica que no esté vacío o protegido.",
          );
        }

        // Send to AI for processing
        setProgress(50);
        const result = await processFileContent(content, format, budgetId);
        setProgress(90);

        if (!result.transactions || result.transactions.length === 0) {
          throw new Error(
            "No se encontraron transacciones en el archivo. Verifica que el formato sea correcto.",
          );
        }

        // Convert to editable transactions
        const editable: EditableTransaction[] = result.transactions.map(
          (t, index) => ({
            ...t,
            id: `import-${Date.now()}-${index}`,
            selected: true,
          }),
        );

        setTransactions(editable);
        setProgress(100);

        const expenses = editable.filter((t) => t.type === "expense").length;
        const incomes = editable.filter((t) => t.type === "income").length;
        showToast(
          `${editable.length} transacciones detectadas (${expenses} gastos, ${incomes} ingresos)`,
          "success",
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al procesar el archivo. Por favor, inténtalo de nuevo.";
        setError(errorMessage);
        showToast(errorMessage, "error");
      } finally {
        setIsProcessing(false);
      }
    },
    [extractTextFromCSV, readFileAsBase64, showToast],
  );

  const saveTransactions = useCallback(
    async (
      budgetId: string,
      txs: EditableTransaction[],
      categoryMap: Record<string, number>,
    ): Promise<boolean> => {
      const selected = txs.filter((t) => t.selected);
      if (selected.length === 0) {
        showToast("No hay transacciones seleccionadas", "warning");
        return false;
      }

      setIsSaving(true);
      try {
        const items: BulkImportItem[] = selected.map((t) => ({
          type: t.type,
          amount: t.amount,
          description: t.description || undefined,
          date: t.date,
          category_id:
            t.type === "expense" && t.category
              ? (categoryMap[t.category.toLowerCase()] ?? null)
              : null,
        }));

        const result = await bulkImportTransactions(budgetId, items);

        showToast(
          `${result.created} transacciones importadas correctamente`,
          "success",
        );
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al importar las transacciones";
        showToast(errorMessage, "error");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [showToast],
  );

  const updateTransaction = useCallback(
    (id: string, updates: Partial<EditableTransaction>) => {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      );
    },
    [],
  );

  const toggleTransaction = useCallback((id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t)),
    );
  }, []);

  const toggleAll = useCallback((selected: boolean) => {
    setTransactions((prev) => prev.map((t) => ({ ...t, selected })));
  }, []);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setIsSaving(false);
    setProgress(0);
    setTransactions([]);
    setError(null);
    setFileName(null);
  }, []);

  return {
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
  };
}
