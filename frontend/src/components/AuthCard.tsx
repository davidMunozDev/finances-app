"use client";

import { Box, Stack, Typography } from "@mui/material";

interface AuthCardProps {
  logo?: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthCard({ logo, title, subtitle, children }: AuthCardProps) {
  return (
    <Box sx={{ width: "100%", maxWidth: 440 }}>
      {/* Logo */}
      {logo && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          {logo}
        </Box>
      )}

      {/* Card */}
      <Box
        sx={{
          width: "100%",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: 1,
          p: { xs: 4, sm: 5 },
          boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Header */}
        <Stack spacing={0.5} mb={4} alignItems="center">
          <Typography
            sx={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "text.primary",
              textAlign: "center",
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "text.secondary",
                textAlign: "center",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Stack>

        {/* Content */}
        {children}
      </Box>
    </Box>
  );
}
