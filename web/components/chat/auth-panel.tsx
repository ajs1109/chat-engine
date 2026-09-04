"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { login, signUp, writeStoredProfile } from "@/lib/api/client";
import type { AuthProfile } from "@/lib/types/chat";

type AuthPanelProps = {
  onAuthenticated: (profile: AuthProfile) => void;
};

type AuthMode = "signin" | "signup";

export function AuthPanel({ onAuthenticated }: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (mode === "signup" && password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Re-enter the same password in both fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const profile =
        mode === "signin"
          ? await login(email, password)
          : await signUp({
              fname: firstName,
              lname: lastName,
              email,
              password,
              confirmPassword
            });
      writeStoredProfile(profile);
      onAuthenticated(profile);
      toast({
        title: mode === "signin" ? "Welcome back" : "Account created",
        description: "Your conversations are ready."
      });
    } catch (error) {
      toast({
        title: mode === "signin" ? "Could not sign in" : "Could not create account",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    email.trim() &&
    password &&
    (mode === "signin" || (firstName.trim() && lastName.trim() && confirmPassword));

  return (
    <section className="w-full max-w-md" aria-labelledby="auth-title">
      <div className="mb-7 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1" aria-label="Account options">
        <button
          type="button"
          aria-pressed={mode === "signin"}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm"
          onClick={() => changeMode("signin")}
        >
          Sign in
        </button>
        <button
          type="button"
          aria-pressed={mode === "signup"}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm"
          onClick={() => changeMode("signup")}
        >
          Create account
        </button>
      </div>

      <div className="mb-7">
        <h1 id="auth-title" className="text-3xl font-bold tracking-[-0.03em] text-foreground">
          {mode === "signin" ? "Welcome back" : "Join Chat Engine"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {mode === "signin"
            ? "Sign in to continue your conversations."
            : "Create an account to start messaging in a few seconds."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {mode === "signup" ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" htmlFor="first-name">
              <Input
                id="first-name"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </Field>
            <Field label="Last name" htmlFor="last-name">
              <Input
                id="last-name"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </Field>
          </div>
        ) : null}

        <Field label="Email address" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>

        {mode === "signup" ? (
          <Field label="Confirm password" htmlFor="confirm-password">
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </Field>
        ) : null}

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading || !canSubmit}>
          {mode === "signin" ? <ArrowRight /> : <UserPlus />}
          {loading
            ? mode === "signin"
              ? "Signing in..."
              : "Creating account..."
            : mode === "signin"
              ? "Continue"
              : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signin" ? "New to Chat Engine?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="font-semibold text-primary underline-offset-4 hover:underline"
          onClick={() => changeMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Create one" : "Sign in"}
        </button>
      </p>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="grid gap-1.5 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}
