"use client";

import { Paper, type SxProps, type Theme } from "@mui/material";
import Link from "next/link";
import { type ReactNode } from "react";

interface DashboardCardProps {
  children: ReactNode;
  href?: string;
  isLoading?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * Reusable card component for dashboard blocks
 * Provides consistent styling with optional click behavior
 */
export function DashboardCard({
  children,
  href = "#",
  isLoading = false,
  sx,
}: DashboardCardProps) {
  const paperSx: SxProps<Theme> = {
    borderRadius: 2,
    p: 3,
    boxShadow: 2,
    height: "100%",
    ...sx,
  };

  // If loading, don't make it clickable
  if (isLoading) {
    return <Paper sx={paperSx}>{children}</Paper>;
  }

  // Clickable card wrapped with Link
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Paper
        sx={{
          ...paperSx,
          cursor: "pointer",
          transition: "box-shadow 0.3s ease-in-out",
          "&:hover": {
            boxShadow: 4,
          },
        }}
      >
        {children}
      </Paper>
    </Link>
  );
}
