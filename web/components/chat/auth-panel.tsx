"use client";

import { FormEvent, useState } from "react";
import { LogIn } from "lucide-react";
import { login, writeStoredProfile } from "@/lib/api/client";
import type { AuthProfile } from "@/lib/types/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type AuthPanelProps = {
  onAuthenticated: (profile: AuthProfile) => void;
};

export function AuthPanel({ onAuthenticated }: AuthPanelProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const profile = await login(email, password);
      writeStoredProfile(profile);
      onAuthenticated(profile);
      toast({ title: "Signed in", description: "Your chat sessions are ready." });
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Check your credentials.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border bg-background p-4">
      <div>
        <h2 className="text-sm font-semibold">Connect to chat engine</h2>
        <p className="text-xs text-muted-foreground">Use an existing account from the Express backend.</p>
      </div>
      <Input
        type="email"
        autoComplete="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Input
        type="password"
        autoComplete="current-password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Button type="submit" disabled={loading || !email || !password}>
        <LogIn className="h-4 w-4" />
        {loading ? "Signing in" : "Sign in"}
      </Button>
    </form>
  );
}
