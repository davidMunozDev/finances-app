"use client";

import React from "react";
import {
  Box,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { ArrowBack, ArrowForward, SkipNext } from "@mui/icons-material";

interface OnboardingNavigationProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  skip: boolean;
  onPrevious: () => void;
  onContinue: () => void;
  onSkip: () => void;
  isSubmitting?: boolean;
}

export default function OnboardingNavigation({
  isFirstStep,
  isLastStep,
  skip,
  onPrevious,
  onContinue,
  onSkip,
  isSubmitting = false,
}: OnboardingNavigationProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        pt: 3,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Botón Anterior */}
      {!isFirstStep ? (
        isMobile ? (
          <IconButton
            onClick={onPrevious}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              width: 48,
              height: 48,
            }}
          >
            <ArrowBack />
          </IconButton>
        ) : (
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={onPrevious}
            sx={{
              px: 3,
              py: 1.5,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
              borderRadius: 2,
            }}
          >
            Anterior
          </Button>
        )
      ) : (
        <Box />
      )}

      {/* Botones Skip y Continuar */}
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Botón Skip (no se muestra en el último paso) */}
        {!isLastStep && skip && (
          <Button
            variant="text"
            endIcon={<SkipNext />}
            onClick={onSkip}
            sx={{
              px: 3,
              py: 1.5,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
              color: "text.secondary",
              borderRadius: 2,
              "&:hover": {
                color: "primary.main",
                bgcolor: "rgba(47, 126, 248, 0.04)",
              },
            }}
          >
            Saltar
          </Button>
        )}

        {/* Botón Continuar/Finalizar */}
        <Button
          variant="contained"
          endIcon={!isLastStep && !isSubmitting && <ArrowForward />}
          onClick={onContinue}
          disabled={isSubmitting}
          startIcon={
            isSubmitting && <CircularProgress size={20} color="inherit" />
          }
          sx={{
            px: 4,
            py: 1.5,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(47, 126, 248, 0.3)",
            "&:hover": {
              boxShadow: "0 6px 16px rgba(47, 126, 248, 0.4)",
            },
          }}
        >
          {isSubmitting
            ? "Completando..."
            : isLastStep
            ? "Finalizar"
            : "Siguiente"}
        </Button>
      </Box>
    </Box>
  );
}
