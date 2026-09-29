import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, Field } from "./login";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset Password — Synthera" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSent(true);
  };

  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a secure recovery link">
      {sent ? (
        <div className="rounded-md border border-teal/30 bg-teal/5 p-4 text-sm text-foreground">
          If an account exists for <strong>{email}</strong>, a reset link is on its way.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-gradient-teal py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/login" className="text-teal hover:underline">Back to sign in</Link>
      </p>
    </AuthShell>
  );
}
