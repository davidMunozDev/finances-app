"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentUser } from "@/data/auth/hooks";
import { paths } from "@/config/paths";
import { Loader } from "@/components";

type OnboardingGuardProps = {
  children: ReactNode;
};

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;

    // Si no hay usuario, no hacemos nada (AuthGuard se encargará)
    if (!user) return;

    // Si el usuario NO ha completado el onboarding
    if (!user.onboarding_completed) {
      // Si no está ya en la ruta de onboarding, redirigir
      if (!pathname.startsWith(paths.platform.onboarding.root)) {
        router.push(paths.platform.onboarding.user);
      }
      return;
    }

    // Si el usuario SÍ ha completado el onboarding
    if (user.onboarding_completed) {
      // Si está en la ruta de onboarding, redirigir al dashboard
      if (pathname.startsWith(paths.platform.onboarding.root)) {
        router.push(paths.platform.home);
      }
    }
  }, [user, isLoading, pathname, router]);

  // Mientras carga, mostrar loading o nada
  if (isLoading) {
    return <Loader />;
  }

  return <>{children}</>;
}
