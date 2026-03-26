"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/src/components/providers/theme-provider";

export function AppToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-right"
      richColors
      theme={theme === "dark" ? "dark" : "light"}
    />
  );
}
