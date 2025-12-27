"use client";

import { ReactNode } from "react";
import { AuthGuard } from "@/auth";
import { OnboardingGuard } from "@/onboarding/OnboardingGuard";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <OnboardingGuard>{children}</OnboardingGuard>
    </AuthGuard>
  );
}
