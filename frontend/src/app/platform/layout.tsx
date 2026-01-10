"use client";

import { ReactNode } from "react";
import { AuthGuard } from "@/auth";
import { OnboardingGuard } from "@/onboarding/OnboardingGuard";
import { ToastProvider } from "@/hooks/useToast";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <OnboardingGuard>
        <ToastProvider>{children}</ToastProvider>
      </OnboardingGuard>
    </AuthGuard>
  );
}
