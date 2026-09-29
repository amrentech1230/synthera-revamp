import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { AuthShell, Field, Divider, GoogleIcon } from "./login";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create Account — Synthera Therapeutics" }] }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [news, setNews] = useState(true);
  const [busy, setBusy] = useState(false);

  const strength = passwordStrength(password);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terms) return toast.error("Please accept the terms");
    if (password !== confirm) return toast.error("Passwords do not match");
    if (strength < 2) return toast.error("Password is too weak");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/customer/dashboard`,
        data: { first_name: first, last_name: last, phone, newsletter_opt_in: news },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. Check your email to verify.");
    nav({ to: "/login" });
  };

  const onGoogle = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Google sign-in failed");
  };

  return (
    <AuthShell title="Create your account" subtitle="Join the Synthera lab">
      <button
        type="button"
        onClick={onGoogle}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background py-2.5 text-sm font-medium hover:bg-muted"
      >
        <GoogleIcon /> Sign up with Google
      </button>
      <Divider />
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" value={first} onChange={setFirst} required />
          <Field label="Last name" value={last} onChange={setLast} required />
        </div>
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Phone" type="tel" value={phone} onChange={setPhone} />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
        <PasswordMeter level={strength} />
        <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} required />

        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 accent-teal" />
          I agree to the <Link to="/terms" className="text-teal hover:underline">Terms</Link> and <Link to="/privacy" className="text-teal hover:underline">Privacy Policy</Link>.
        </label>
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={news} onChange={(e) => setNews(e.target.checked)} className="mt-0.5 accent-teal" />
          Email me research updates and members-only offers.
        </label>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-gradient-teal py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition disabled:opacity-50"
        >
          {busy ? "Creating..." : "Create Account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="font-medium text-teal hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}

function passwordStrength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

function PasswordMeter({ level }: { level: number }) {
  const labels = ["Too weak", "Weak", "Okay", "Strong", "Excellent"];
  const colors = ["bg-destructive", "bg-destructive", "bg-yellow-500", "bg-teal", "bg-teal"];
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded ${i < level ? colors[level] : "bg-border"}`} />
        ))}
      </div>
      <div className="text-xs text-muted-foreground">{labels[level]}</div>
    </div>
  );
}
