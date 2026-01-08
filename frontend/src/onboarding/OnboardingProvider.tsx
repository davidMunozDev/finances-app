"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { completeOnboarding } from "@/data/onboarding/api";
import type {
  UserData,
  BudgetData,
  Income,
  OnboardingCategory,
  Provision,
  OnboardingData,
} from "@/data/onboarding/types";

type OnboardingContextType = {
  data: OnboardingData;
  setUserData: (userData: UserData) => void;
  setBudgetData: (budgetData: BudgetData) => void;
  setIncomes: (incomes: Income[]) => void;
  setCategories: (categories: OnboardingCategory[]) => void;
  setProvisions: (provisions: Provision[]) => void;
  clearOnboardingData: () => void;
  setSubmitHandler: (handler: (() => Promise<boolean>) | null) => void;
  triggerSubmit: () => Promise<boolean>;
  submitOnboarding: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

const STORAGE_KEY = "onboarding_data";

const initialData: OnboardingData = {
  user: null,
  budget: null,
  incomes: [],
  categories: [],
  provisions: [],
};

// Función para cargar datos del localStorage
const loadOnboardingData = (): OnboardingData => {
  if (typeof window === "undefined") return initialData;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Error loading onboarding data:", error);
  }
  return initialData;
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(loadOnboardingData);
  const [submitHandler, setSubmitHandler] = useState<
    (() => Promise<boolean>) | null
  >(null);

  // Guardar datos en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const setUserData = (userData: UserData) => {
    setData((prev) => ({ ...prev, user: userData }));
  };

  const setBudgetData = (budgetData: BudgetData) => {
    setData((prev) => ({ ...prev, budget: budgetData }));
  };

  const setIncomes = (incomes: Income[]) => {
    setData((prev) => ({ ...prev, incomes }));
  };

  const setCategories = (categories: OnboardingCategory[]) => {
    setData((prev) => ({ ...prev, categories }));
  };

  const setProvisions = (provisions: Provision[]) => {
    setData((prev) => ({ ...prev, provisions }));
  };

  const clearOnboardingData = () => {
    setData(initialData);
    localStorage.removeItem(STORAGE_KEY);
  };

  const triggerSubmit = async (): Promise<boolean> => {
    if (submitHandler) {
      return await submitHandler();
    }
    return true; // Si no hay handler, permitir continuar
  };

  const submitOnboarding = async () => {
    try {
      await completeOnboarding(data);
      clearOnboardingData();
    } catch (error) {
      console.error("Error completing onboarding:", error);
      throw error;
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        data,
        setUserData,
        setBudgetData,
        setIncomes,
        setCategories,
        setProvisions,
        clearOnboardingData,
        setSubmitHandler: (handler) => setSubmitHandler(() => handler),
        triggerSubmit,
        submitOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
