"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "./hooks";
import { paths } from "@/config/paths";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  const isPublicRoute = pathname?.startsWith("/auth");

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      router.push(paths.auth.signIn);
    }
  }, [isLoading, isAuthenticated, isPublicRoute, router, pathname]);

  // Mostrar loading mientras verifica la autenticación (solo en rutas protegidas)
  if (isLoading && !isPublicRoute) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Si no está autenticado y no es ruta pública, no mostrar contenido (se redirigirá)
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }
  return <>{children}</>;
}
