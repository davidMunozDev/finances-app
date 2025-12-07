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
} from "@/components/ui";
import { useRouter } from "next/navigation";
import { PATHS } from "@/config/paths";

// Esquema de validación con Zod
const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "El email es requerido")
      .email("Ingresa un email válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    repeatPassword: z.string().min(1, "Por favor confirma tu contraseña"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Las contraseñas no coinciden",
    path: ["repeatPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: RegisterFormData) => {
    // Aquí irá la lógica de registro
    console.log("Form data:", data);
    // Simular un delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Navegar a la página del dashboard
    router.push(PATHS.HOME);
  };

  return (
    <AuthCard
      logo={<Logo />}
      title="Crear cuenta"
      subtitle="Completa tus datos para comenzar"
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

          {/* Repeat Password */}
          <PasswordField
            {...register("repeatPassword")}
            label="Repetir contraseña"
            placeholder="Repite tu contraseña"
            error={!!errors.repeatPassword}
            helperText={errors.repeatPassword?.message}
          />

          {/* Botón de submit */}
          <RoundedButton type="submit" disabled={isSubmitting} sx={{ mt: 1 }}>
            {isSubmitting ? "Creando cuenta..." : "Registrarse"}
          </RoundedButton>

          {/* Link a login */}
          <Box textAlign="center" mt={2}>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "text.secondary",
              }}
            >
              ¿Ya tienes una cuenta?{" "}
              <MuiLink
                component={Link}
                href={PATHS.SIGN_IN}
                sx={{
                  color: "primary.main",
                  fontWeight: "semibold",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Iniciar sesión
              </MuiLink>
            </Typography>
          </Box>
        </Stack>
      </form>
    </AuthCard>
  );
}
