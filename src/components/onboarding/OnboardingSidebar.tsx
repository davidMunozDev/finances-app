"use client";

import React from "react";
import { Box, Typography, Paper, useTheme } from "@mui/material";
import { ONBOARDING_STEPS } from "@/config/onboarding";

interface OnboardingSidebarProps {
  currentStepId: string;
  currentStepIndex: number;
  completedSteps: string[];
}

export default function OnboardingSidebar({
  currentStepId,
  currentStepIndex,
  completedSteps,
}: OnboardingSidebarProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        width: 340,
        bgcolor: "background.paper",
        borderRight: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Logo o Título */}
      <Box sx={{ p: 4, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "primary.main",
            mb: 1,
          }}
        >
          Configuración Inicial
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Completa los siguientes pasos para empezar
        </Typography>
      </Box>

      {/* Stepper Vertical */}
      <Box sx={{ flex: 1, p: 3 }}>
        {ONBOARDING_STEPS.map((step, index) => {
          const isActive = step.id === currentStepId;
          const isCompleted =
            completedSteps.includes(step.id) || index < currentStepIndex;
          const StepIcon = step.icon;

          return (
            <Box
              key={step.id}
              sx={{
                display: "flex",
                gap: 2,
                mb: 3,
                position: "relative",
              }}
            >
              {/* Línea conectora */}
              {index < ONBOARDING_STEPS.length - 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    left: 23,
                    top: 48,
                    width: 2,
                    height: 40,
                    bgcolor: isCompleted ? "primary.main" : "divider",
                  }}
                />
              )}

              {/* Icono del paso */}
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor:
                    isActive || isCompleted
                      ? "primary.main"
                      : "background.default",
                  border: `2px solid ${
                    isActive || isCompleted
                      ? theme.palette.primary.main
                      : theme.palette.divider
                  }`,
                  color: isActive || isCompleted ? "#fff" : "text.secondary",
                  flexShrink: 0,
                  transition: "all 0.3s ease",
                  boxShadow: isActive
                    ? "0 4px 12px rgba(47, 126, 248, 0.3)"
                    : "none",
                }}
              >
                <Box component={StepIcon} sx={{ fontSize: 24 }} />
              </Box>

              {/* Información del paso */}
              <Box sx={{ flex: 1, pt: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    mb: 0.5,
                  }}
                >
                  Paso {index + 1}/{ONBOARDING_STEPS.length}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "primary.main" : "text.primary",
                    mb: 0.5,
                  }}
                >
                  {step.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.875rem",
                  }}
                >
                  {step.description}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
