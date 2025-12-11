"use client";

import { Box, Button, IconButton, InputAdornment } from "@mui/material";
import {
  TrendingDownOutlined,
  TrendingUpOutlined,
  AddCircleOutline,
  DeleteOutline,
  AttachMoney,
} from "@mui/icons-material";
import { FormTextField } from "@/components";
import { Control, Controller, useFieldArray } from "react-hook-form";

interface TransactionItem {
  name: string;
  amount: number;
}

interface TransactionItemListProps {
  control: Control<any>;
  errors?: any;
  name?: string;
  type?: "income" | "expense";
  nameLabel?: string;
  namePlaceholder?: string;
  addButtonLabel?: string;
}

export default function TransactionItemList({
  control,
  errors,
  name = "items",
  type = "expense",
  nameLabel,
  namePlaceholder,
  addButtonLabel,
}: TransactionItemListProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const isIncome = type === "income";

  // Valores por defecto según el tipo
  const defaultNameLabel = isIncome ? "Nombre del ingreso" : "Nombre del gasto";
  const defaultPlaceholder = isIncome
    ? "Ej: Salario, Freelance, Inversiones"
    : "Ej: Hipoteca, Luz, Internet";
  const defaultAddButtonLabel = isIncome ? "Añade ingreso" : "Añade gasto";

  const handleAddItem = () => {
    append({ name: "", amount: 0 });
  };

  const handleRemoveItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Box>
      {/* Lista de Items */}
      {fields.map((field, index) => (
        <Box
          key={field.id}
          sx={{
            mb: 2,
            display: "flex",
            gap: 2,
            alignItems: "flex-start",
          }}
        >
          {/* Campo Nombre */}
          <Box sx={{ flex: 2 }}>
            <Controller
              name={`${name}.${index}.name`}
              control={control}
              render={({ field }) => (
                <FormTextField
                  {...field}
                  label={index === 0 ? nameLabel || defaultNameLabel : ""}
                  placeholder={namePlaceholder || defaultPlaceholder}
                  error={!!errors?.[name]?.[index]?.name}
                  helperText={errors?.[name]?.[index]?.name?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {isIncome ? (
                          <TrendingUpOutlined
                            sx={{ color: "text.secondary" }}
                          />
                        ) : (
                          <TrendingDownOutlined
                            sx={{ color: "text.secondary" }}
                          />
                        )}
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "background.paper",
                    },
                  }}
                />
              )}
            />
          </Box>

          {/* Campo Monto */}
          <Box sx={{ width: 100 }}>
            <Controller
              name={`${name}.${index}.amount`}
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <FormTextField
                  {...field}
                  label={index === 0 ? "Monto" : ""}
                  type="number"
                  placeholder="0"
                  value={value}
                  onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                  error={!!errors?.[name]?.[index]?.amount}
                  helperText={errors?.[name]?.[index]?.amount?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney
                          sx={{
                            color: isIncome ? "success.main" : "error.main",
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "background.paper",
                    },
                  }}
                />
              )}
            />
          </Box>

          {/* Botón Eliminar */}
          {fields.length > 1 && (
            <IconButton
              onClick={() => handleRemoveItem(index)}
              sx={{
                mt: index === 0 ? 3 : 0,
                color: "error.main",
                "&:hover": {
                  bgcolor: "error.lighter",
                },
              }}
            >
              <DeleteOutline />
            </IconButton>
          )}
        </Box>
      ))}

      {/* Botón Añadir Item */}
      <Button
        variant="text"
        startIcon={<AddCircleOutline />}
        onClick={handleAddItem}
        sx={{
          textTransform: "none",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "primary.main",
          "&:hover": {
            bgcolor: "primary.lighter",
          },
        }}
      >
        {addButtonLabel || defaultAddButtonLabel}
      </Button>
    </Box>
  );
}
