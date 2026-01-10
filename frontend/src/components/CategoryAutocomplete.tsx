"use client";

import { Box, Typography, TextField, Autocomplete } from "@mui/material";
import { Control, Controller, FieldError } from "react-hook-form";

interface CategoryAutocompleteProps {
  control: Control<any>;
  name?: string;
  error?: FieldError;
  existingCategories: string[];
  label?: string;
  placeholder?: string;
}

export default function CategoryAutocomplete({
  control,
  name = "category",
  error,
  existingCategories,
  label = "Categoría",
  placeholder = "Ej: Casa, Transporte, Ocio",
}: CategoryAutocompleteProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <Autocomplete
          freeSolo
          value={value}
          onChange={(_, newValue) => onChange(newValue)}
          onInputChange={(_, newValue) => onChange(newValue)}
          options={existingCategories}
          renderInput={(params) => (
            <Box>
              <Typography
                component="label"
                sx={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "medium",
                  color: "text.primary",
                  mb: 0.75,
                }}
              >
                {label}
              </Typography>
              <TextField
                {...params}
                placeholder={placeholder}
                error={!!error}
                helperText={error?.message}
                InputProps={{
                  ...params.InputProps,
                  sx: {
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  },
                }}
              />
            </Box>
          )}
        />
      )}
    />
  );
}
