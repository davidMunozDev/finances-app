"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, Container, useTheme, useMediaQuery, Link } from "@mui/material";
import {
  OnboardingSidebar,
  OnboardingMobileHeader,
  OnboardingHeader,
  OnboardingNavigation,
} from "@/onboarding/components";
import {
  OnboardingProvider,
  useOnboarding,
} from "@/onboarding/OnboardingProvider";
import {
  ONBOARDING_STEPS,
  getNextStep,
  getPreviousStep,
} from "@/config/onboarding";
import { paths } from "@/config/paths";
import { logoutUser } from "@/data/auth/api";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <OnboardingProvider>
      <OnboardingLayoutContent>{children}</OnboardingLayoutContent>
    </OnboardingProvider>
  );
}

function OnboardingLayoutContent({ children }: OnboardingLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const { triggerSubmit, submitOnboarding } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleContinue = async () => {
    // Ejecutar el submit del paso actual
    const isValid = await triggerSubmit();

    if (!isValid) {
      return; // No continuar si la validación falla
    }

    if (currentStepId) {
      markStepAsCompleted(currentStepId);
    }

    if (isLastStep) {
      // Enviar todos los datos al backend
      try {
        setIsSubmitting(true);
        await submitOnboarding();
        localStorage.removeItem("onboarding_completed_steps");
        router.push(paths.platform.home);
      } catch (error) {
        console.error("Error completing onboarding:", error);
        setIsSubmitting(false);
        // El error se muestra en el componente outcomes
      }
    } else if (nextStep) {
      router.push(nextStep.path);
    }
  };

  const handleSkip = () => {
    if (isLastStep) {
      localStorage.removeItem("onboarding_completed_steps");
      router.push(paths.platform.home);
    } else if (nextStep) {
      router.push(nextStep.path);
    }
  };

  const handleGoToHome = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Error during logout:", error);
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
      {/* Enlace Ir a inicio - Esquina superior derecha */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: 16, md: 24 },
          right: { xs: 16, md: 32 },
          zIndex: 1000,
        }}
      >
        <Link
          component="button"
          onClick={handleGoToHome}
          sx={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "primary.main",
            textDecoration: "none",
            cursor: "pointer",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          Ir a inicio
        </Link>
      </Box>
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
              py: { xs: 2, md: 6 },
              px: { xs: 3, md: 12 },
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
              skip={currentStep?.skip || false}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              onPrevious={handlePrevious}
              onContinue={handleContinue}
              onSkip={handleSkip}
              isSubmitting={isSubmitting}
            />
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
