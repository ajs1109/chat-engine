import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Chat Engine",
  description: "Real-time conversations and an AI assistant in one familiar workspace"
};

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const directionContract = `THESIS: Chat Engine is a conversation-first messenger that refuses dashboard chrome and hidden primary actions.
OWN-WORLD: Restrained sky blue, clear white or ink surfaces, compact circular controls, dense conversation rows, and calm message bubbles.
STORY: Create an account or sign in, choose a person or the assistant, then communicate without learning a new interface.
FIRST VIEWPORT: A 360px conversation rail sits beside one dominant thread; mobile shows one pane at a time, with auth and theme actions immediately visible.
FORM: Familiar messenger canon, pinned by the brief; seed 7c82cbc3.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance`;

const themeBootScript = `(() => { try { const saved = localStorage.getItem("chat-engine-theme"); const dark = saved === "dark" || (!saved && matchMedia("(prefers-color-scheme: dark)").matches); document.documentElement.classList.toggle("dark", dark); document.documentElement.style.colorScheme = dark ? "dark" : "light"; } catch {} })();`;

const contractScript = `document.currentScript?.before(document.createComment(${JSON.stringify(directionContract)}));`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={manrope.variable}>
        <script dangerouslySetInnerHTML={{ __html: contractScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
