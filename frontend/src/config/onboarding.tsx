import {
  PersonOutline,
  AccountBalanceWalletOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  AssessmentOutlined,
} from "@mui/icons-material";
import { paths } from "./paths";

export interface OnboardingStep {
  id: string;
  label: string;
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType;
  skip?: boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "user",
    label: "Usuario",
    title: "Configura tu perfil",
    description: "Completa tu información personal",
    path: paths.platform.onboarding.user,
    icon: PersonOutline,
    skip: false,
  },
  {
    id: "budget",
    label: "Presupuesto",
    title: "Crea tu primer presupuesto",
    description: "Define cuánto quieres gastar este mes",
    path: paths.platform.onboarding.budget,
    icon: AccountBalanceWalletOutlined,
    skip: false,
  },
  {
    id: "incomes",
    label: "Ingresos",
    title: "Registra tus ingresos",
    description: "Añade tus fuentes de ingreso",
    path: paths.platform.onboarding.incomes,
    icon: TrendingUpOutlined,
    skip: true,
  },
  {
    id: "outcomes",
    label: "Gastos",
    title: "Registra tus gastos",
    description: "Añade tus gastos principales",
    path: paths.platform.onboarding.outcomes,
    icon: TrendingDownOutlined,
    skip: true,
  },
  {
    id: "summary",
    label: "Resumen",
    title: "¡Todo preparado!",
    description:
      "Aquí tienes un resumen de tu presupuesto. Puedes modificar esta información en cualquier momento desde el dashboard.",
    path: paths.platform.onboarding.summary,
    icon: AssessmentOutlined,
  },
];

export const getStepIndex = (stepId: string): number => {
  return ONBOARDING_STEPS.findIndex((step) => step.id === stepId);
};

export const getStepById = (stepId: string): OnboardingStep | undefined => {
  return ONBOARDING_STEPS.find((step) => step.id === stepId);
};

export const getNextStep = (currentStepId: string): OnboardingStep | null => {
  const currentIndex = getStepIndex(currentStepId);
  if (currentIndex === -1 || currentIndex === ONBOARDING_STEPS.length - 1) {
    return null;
  }
  return ONBOARDING_STEPS[currentIndex + 1];
};

export const getPreviousStep = (
  currentStepId: string
): OnboardingStep | null => {
  const currentIndex = getStepIndex(currentStepId);
  if (currentIndex <= 0) {
    return null;
  }
  return ONBOARDING_STEPS[currentIndex - 1];
};
