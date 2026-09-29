import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { DnaBackdrop } from "@/components/site/dna-backdrop";
import { toast } from "sonner";
import logo from "@/assets/synthera-logo.png";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({ meta: [{ title: "Sign In — Synthera Therapeutics" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error("Invalid email or password. Please try again.");
    toast.success("Welcome back");
    nav({ to: search.redirect ?? "/customer/dashboard" });
  };

  const onGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    nav({ to: "/customer/dashboard" });
  };

  return (
    <AuthShell title="Welcome to Synthera" subtitle="Sign in to access the Synthera product portal">
      <button
        type="button"
        onClick={onGoogle}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
      >
        <GoogleIcon /> Continue with Google
      </button>
      <Divider />
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input type="checkbox" className="accent-teal" /> Remember me
          </label>
          <Link to="/forgot-password" className="text-teal hover:underline">Forgot password?</Link>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-gradient-teal py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition disabled:opacity-50"
        >
          {busy ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Synthera? <Link to="/signup" className="font-medium text-teal hover:underline">Create account</Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-ink py-16 text-background">
      <DnaBackdrop className="opacity-30" />
      <div className="relative mx-4 w-full max-w-md">
        <div className="glass rounded-md p-8 text-foreground glow-teal">
          <Link to="/" className="mx-auto mb-6 flex items-center justify-center gap-3">
            <img src={logo} alt="Synthera" className="h-12" />
          </Link>
          <h1 className="text-center font-display text-2xl font-semibold">{title}</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function Field({
  label, value, onChange, type = "text", required, autoComplete,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; autoComplete?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus:border-teal focus:outline-none"
      />
    </label>
  );
}

export function Divider() {
  return (
    <div className="relative my-5 text-center text-xs uppercase tracking-wider text-muted-foreground">
      <span className="relative z-10 bg-card px-3">or</span>
      <div className="absolute left-0 top-1/2 h-px w-full bg-border" />
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
