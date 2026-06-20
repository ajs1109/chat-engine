"use client";

import type { ReactNode } from "react";

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="min-h-dvh bg-background text-foreground">{children}</div>;
}
