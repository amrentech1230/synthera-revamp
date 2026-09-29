import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, Field } from "./login";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set New Password — Synthera" }] }),
  component: ResetPage,
});

function ResetPage() {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== confirm) return toast.error("Passwords do not match");
    if (pw.length < 8) return toast.error("Use at least 8 characters");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    nav({ to: "/customer/dashboard" });
  };

  return (
    <AuthShell title="Set a new password" subtitle="Make it strong">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="New password" type="password" value={pw} onChange={setPw} required />
        <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} required />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-gradient-teal py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Saving..." : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}
