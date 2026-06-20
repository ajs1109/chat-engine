import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { RuntimeProvider } from "@/components/providers/runtime-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Chat Engine",
  description: "Production-ready chat workspace for the chat-engine backend"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <RuntimeProvider>
            <ToastProvider>{children}</ToastProvider>
          </RuntimeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
