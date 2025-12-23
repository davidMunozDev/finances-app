"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Stack, Box, Typography, Link as MuiLink, Alert } from "@mui/material";
import Link from "next/link";
import {
  FormTextField,
  PasswordField,
  RoundedButton,
  AuthCard,
  Logo,
} from "@/components";
import { useRouter } from "next/navigation";
import { paths } from "@/config/paths";
import { loginUser } from "@/auth";
import { useState } from "react";

// Esquema de validación con Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Ingresa un email válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await loginUser(data);

      // Redirigir al home
      router.push(paths.platform.home);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err?.message || "Error al iniciar sesión. Verifica tus credenciales."
      );
    }
  };

  return (
    <AuthCard
      logo={<Logo />}
      title="Iniciar sesión"
      subtitle="Ingresa tus credenciales para continuar"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.5}>
          {/* Error message */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Email */}
          <FormTextField
            {...register("email")}
            label="Correo electrónico"
            type="email"
            placeholder="Ingresa tu correo"
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          {/* Password */}
          <PasswordField
            {...register("password")}
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          {/* Botón de submit */}
          <RoundedButton type="submit" disabled={isSubmitting} sx={{ mt: 1 }}>
            {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
          </RoundedButton>

          {/* Link a registro */}
          <Box textAlign="center" mt={2}>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "text.secondary",
              }}
            >
              ¿No tienes una cuenta?{" "}
              <MuiLink
                component={Link}
                href={paths.auth.signUp}
                sx={{
                  color: "primary.main",
                  fontWeight: "semibold",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Regístrate
              </MuiLink>
            </Typography>
          </Box>
        </Stack>
      </form>
    </AuthCard>
  );
}
