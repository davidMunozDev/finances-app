"use client";

import { Box, InputAdornment, Typography } from "@mui/material";
import { PersonOutline } from "@mui/icons-material";
import { FormTextField, FormSelect } from "@/components";
import { CURRENCIES } from "@/config/currencies";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const userSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  currency: z.string().min(1, "Debes seleccionar una moneda"),
});

type UserFormData = z.infer<typeof userSchema>;

export default function User() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      currency: "USD",
    },
  });

  const onSubmit = (data: UserFormData) => {
    console.log("User data:", data);
    // Aquí guardarías los datos
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxWidth: 600, mx: "auto" }}
    >
      {/* Campo de Nombre */}
      <Box sx={{ mb: 3 }}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormTextField
              {...field}
              label="Nombre completo"
              placeholder="Introduce tu nombre"
              error={!!errors.name}
              helperText={errors.name?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline sx={{ color: "text.secondary" }} />
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

      {/* Selector de Moneda */}
      <Controller
        name="currency"
        control={control}
        render={({ field }) => (
          <FormSelect
            {...field}
            label="Moneda preferida"
            error={!!errors.currency}
            options={CURRENCIES.map((curr) => ({
              value: curr.code,
              label: curr.code,
              subtitle: curr.name,
              icon: (
                <Typography
                  component="span"
                  sx={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "primary.main",
                  }}
                >
                  {curr.symbol}
                </Typography>
              ),
            }))}
          />
        )}
      />
    </Box>
  );
}
