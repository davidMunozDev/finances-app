"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { paths } from "@/config/paths";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.push(paths.platform.home);
  }, [router]);

  return null;
}
