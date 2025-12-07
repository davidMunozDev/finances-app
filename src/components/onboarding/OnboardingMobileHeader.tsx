"use client";

import React from "react";
import { Box, Typography, Paper, useTheme } from "@mui/material";
import { ONBOARDING_STEPS, OnboardingStep } from "@/config/onboarding";

interface OnboardingMobileHeaderProps {
  currentStep: OnboardingStep | undefined;
  currentStepIndex: number;
}

export default function OnboardingMobileHeader({
  currentStep,
  currentStepIndex,
}: OnboardingMobileHeaderProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: `1px solid ${theme.palette.divider}`,
        p: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "primary.main",
            color: "#fff",
          }}
        >
          {currentStep?.icon && <currentStep.icon sx={{ fontSize: 20 }} />}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "block" }}
          >
            Paso {currentStepIndex + 1} de {ONBOARDING_STEPS.length}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {currentStep?.label}
          </Typography>
        </Box>
      </Box>

      {/* Barra de progreso móvil */}
      <Box
        sx={{
          width: "100%",
          height: 4,
          bgcolor: "background.default",
          borderRadius: 2,
          mt: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${
              ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100
            }%`,
            height: "100%",
            bgcolor: "primary.main",
            transition: "width 0.3s ease",
          }}
        />
      </Box>
    </Paper>
  );
}
