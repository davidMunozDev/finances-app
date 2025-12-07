"use client";

import React from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Box,
  useTheme,
  useMediaQuery,
  StepConnector,
  stepConnectorClasses,
  StepIconProps,
  styled,
} from "@mui/material";
import { Check } from "@mui/icons-material";
import { ONBOARDING_STEPS, OnboardingStep } from "@/config/onboarding";

// Conector personalizado con estilo moderno
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: theme.palette.primary.main,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: theme.palette.primary.main,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.divider,
    borderRadius: 1,
  },
}));

// Icono personalizado del stepper
const CustomStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor:
    ownerState.completed || ownerState.active
      ? theme.palette.primary.main
      : theme.palette.background.paper,
  border: `2px solid ${
    ownerState.completed || ownerState.active
      ? theme.palette.primary.main
      : theme.palette.divider
  }`,
  zIndex: 1,
  color: "#fff",
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  boxShadow:
    ownerState.completed || ownerState.active
      ? "0 4px 10px 0 rgba(47,126,248,.25)"
      : "none",
  transition: "all 0.3s ease",
  ...(ownerState.active && {
    transform: "scale(1.1)",
  }),
  [theme.breakpoints.down("sm")]: {
    width: 40,
    height: 40,
  },
}));

function CustomStepIcon(props: StepIconProps) {
  const { active, completed, className, icon } = props;

  const stepIndex = Number(icon) - 1;
  const StepIconComponent = ONBOARDING_STEPS[stepIndex]?.icon;

  return (
    <CustomStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {completed ? (
        <Check sx={{ fontSize: 28 }} />
      ) : StepIconComponent ? (
        <Box sx={{ fontSize: 24, color: active ? "#fff" : "text.secondary" }}>
          <StepIconComponent />
        </Box>
      ) : (
        <Box
          sx={{
            fontSize: 18,
            fontWeight: 600,
            color: active ? "#fff" : "text.secondary",
          }}
        >
          {icon}
        </Box>
      )}
    </CustomStepIconRoot>
  );
}

interface OnboardingStepperProps {
  currentStepId: string;
  completedSteps?: string[];
}

export default function OnboardingStepper({
  currentStepId,
  completedSteps = [],
}: OnboardingStepperProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const currentStepIndex = ONBOARDING_STEPS.findIndex(
    (step) => step.id === currentStepId
  );

  return (
    <Box
      sx={{
        width: "100%",
        px: { xs: 1, sm: 3, md: 4 },
        py: 3,
      }}
    >
      <Stepper
        alternativeLabel
        activeStep={currentStepIndex}
        connector={<CustomConnector />}
        sx={{
          "& .MuiStepLabel-label": {
            mt: 1,
            fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
            fontWeight: 500,
          },
          "& .MuiStepLabel-label.Mui-active": {
            color: "primary.main",
            fontWeight: 600,
          },
          "& .MuiStepLabel-label.Mui-completed": {
            color: "text.primary",
            fontWeight: 500,
          },
        }}
      >
        {ONBOARDING_STEPS.map((step, index) => {
          const isCompleted =
            completedSteps.includes(step.id) || index < currentStepIndex;

          return (
            <Step key={step.id} completed={isCompleted}>
              <StepLabel
                slots={{ stepIcon: CustomStepIcon }}
                optional={
                  !isMobile && !isTablet ? (
                    <Box
                      sx={{
                        fontSize: "0.75rem",
                        color: "text.secondary",
                        mt: 0.5,
                      }}
                    >
                      {step.description}
                    </Box>
                  ) : null
                }
              >
                {step.label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}
