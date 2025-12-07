"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Stack, Box, Typography, Link as MuiLink } from "@mui/material";
import Link from "next/link";
import {
  FormTextField,
  PasswordField,
  RoundedButton,
  AuthCard,
  Logo,
} from "@/components";
import { useRouter } from "next/navigation";
import { PATHS } from "@/config/paths";

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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    // Aquí irá la lógica de login
    console.log("Login data:", data);
    // Simular un delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push(PATHS.ONBOARDING.USER);
  };

  return (
    <AuthCard
      logo={<Logo />}
      title="Iniciar sesión"
      subtitle="Ingresa tus credenciales para continuar"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.5}>
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
                href={PATHS.SIGN_UP}
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
