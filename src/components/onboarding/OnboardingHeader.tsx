"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { ONBOARDING_STEPS, OnboardingStep } from "@/config/onboarding";

interface OnboardingHeaderProps {
  currentStep: OnboardingStep | undefined;
  currentStepIndex: number;
}

export default function OnboardingHeader({
  currentStep,
  currentStepIndex,
}: OnboardingHeaderProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="overline"
        sx={{
          color: "text.secondary",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: 1.2,
          display: "block",
          mb: 1,
        }}
      >
        Paso {currentStepIndex + 1}/{ONBOARDING_STEPS.length}
      </Typography>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 700,
          fontSize: { xs: "1.5rem", sm: "1.75rem", md: "1.875rem" },
          color: "text.primary",
          mb: 1,
        }}
      >
        {currentStep?.title}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: "text.secondary",
          fontSize: { xs: "0.875rem", sm: "1rem" },
          lineHeight: 1.6,
        }}
      >
        {currentStep?.description}
      </Typography>
    </Box>
  );
}
