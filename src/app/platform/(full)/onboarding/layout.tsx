"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, Container, useTheme, useMediaQuery } from "@mui/material";
import {
  OnboardingSidebar,
  OnboardingMobileHeader,
  OnboardingHeader,
  OnboardingNavigation,
} from "@/components/onboarding";
import {
  ONBOARDING_STEPS,
  getNextStep,
  getPreviousStep,
} from "@/config/onboarding";
import { PATHS } from "@/config/paths";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Determinar el paso actual basado en la ruta
  const currentStep = ONBOARDING_STEPS.find((step) =>
    pathname.includes(step.id)
  );

  const currentStepId = currentStep?.id || "user";
  const currentStepIndex = ONBOARDING_STEPS.findIndex(
    (step) => step.id === currentStepId
  );

  const previousStep = getPreviousStep(currentStepId);
  const nextStep = getNextStep(currentStepId);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  // Cargar pasos completados del localStorage
  useEffect(() => {
    const saved = localStorage.getItem("onboarding_completed_steps");
    if (saved) {
      setCompletedSteps(JSON.parse(saved));
    }
  }, []);

  // Guardar paso actual como completado al continuar
  const markStepAsCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      const newCompleted = [...completedSteps, stepId];
      setCompletedSteps(newCompleted);
      localStorage.setItem(
        "onboarding_completed_steps",
        JSON.stringify(newCompleted)
      );
    }
  };

  const handlePrevious = () => {
    if (previousStep) {
      router.push(previousStep.path);
    }
  };

  const handleContinue = () => {
    if (currentStepId) {
      markStepAsCompleted(currentStepId);
    }

    if (isLastStep) {
      // Finalizar onboarding y redirigir al dashboard
      localStorage.removeItem("onboarding_completed_steps");
      router.push(PATHS.HOME);
    } else if (nextStep) {
      router.push(nextStep.path);
    }
  };

  const handleSkip = () => {
    if (isLastStep) {
      localStorage.removeItem("onboarding_completed_steps");
      router.push(PATHS.HOME);
    } else if (nextStep) {
      router.push(nextStep.path);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* Sidebar Izquierdo - Stepper Vertical (Desktop) */}
      {!isMobile && (
        <OnboardingSidebar
          currentStepId={currentStepId}
          currentStepIndex={currentStepIndex}
          completedSteps={completedSteps}
        />
      )}

      {/* Contenido Principal */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: { xs: "100vh", md: "auto" },
        }}
      >
        {/* Header móvil con indicador de paso */}
        {isMobile && (
          <OnboardingMobileHeader
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
          />
        )}

        {/* Contenedor del contenido */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
          }}
        >
          <Container
            maxWidth="md"
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              py: { xs: 4, md: 6 },
              px: { xs: 3, md: 6 },
            }}
          >
            {/* Título y Descripción del Paso */}
            <OnboardingHeader
              currentStep={currentStep}
              currentStepIndex={currentStepIndex}
            />

            {/* Contenido del Paso */}
            <Box
              sx={{
                flex: 1,
                mb: 4,
              }}
            >
              {children}
            </Box>

            {/* Botones de Navegación */}
            <OnboardingNavigation
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              onPrevious={handlePrevious}
              onContinue={handleContinue}
              onSkip={handleSkip}
            />
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
