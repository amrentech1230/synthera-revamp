import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Card, PageTitle, useMe } from "@/components/portal/shell";
import { FormField, inputCls } from "@/components/site/public-ui";
import { updateMyProfile } from "@/lib/portal.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/customer/profile")({ component: Profile });

const FIELDS = [
  ["first_name", "First Name"], ["last_name", "Last Name"], ["phone", "Phone"],
  ["company", "Company"], ["job_title", "Job Title"], ["country", "Country"], ["address", "Address"],
] as const;

function Profile() {
  const { data: me, isLoading } = useMe();
  if (isLoading || !me) return <div className="text-muted-foreground">Loading…</div>;
  return <ProfileForm me={me} />;
}

function ProfileForm({ me }: { me: any }) {
  const save = useServerFn(updateMyProfile);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const onSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const data: any = {};
    FIELDS.forEach(([k]) => (data[k] = f[k]?.trim() || null));
    setBusy(true);
    try {
      await save({ data });
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["me"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  };

  const onPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (f.password.length < 8) return toast.error("Password must be at least 8 characters");
    if (f.password !== f.confirm) return toast.error("Passwords do not match");
    const { error } = await supabase.auth.updateUser({ password: f.password, current_password: f.current } as any);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    form.reset();
  };

  return (
    <>
      <PageTitle title="My Profile" subtitle={me.email} />
      <form onSubmit={onSave} className="space-y-6">
        <Card>
          <h2 className="font-display text-lg font-semibold">Personal Information</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {FIELDS.slice(0, 3).map(([k, l]) => <FormField key={k} label={l}><input name={k} defaultValue={me.profile?.[k] ?? ""} className={inputCls} /></FormField>)}
            <FormField label="Email"><input value={me.email ?? ""} disabled className={`${inputCls} opacity-60`} /></FormField>
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-lg font-semibold">Company Information</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {FIELDS.slice(3).map(([k, l]) => <FormField key={k} label={l}><input name={k} defaultValue={me.profile?.[k] ?? ""} className={inputCls} /></FormField>)}
          </div>
        </Card>
        <button disabled={busy} className="rounded-md bg-gradient-teal px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-50">{busy ? "Saving…" : "Save Changes"}</button>
      </form>
      <form onSubmit={onPassword} className="mt-8">
        <Card>
          <h2 className="font-display text-lg font-semibold">Security — Change Password</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <FormField label="Current Password"><input name="current" type="password" required className={inputCls} /></FormField>
            <FormField label="New Password"><input name="password" type="password" required className={inputCls} /></FormField>
            <FormField label="Confirm Password"><input name="confirm" type="password" required className={inputCls} /></FormField>
          </div>
          <button className="mt-5 rounded-md border border-teal px-5 py-2.5 text-sm font-semibold text-teal hover:bg-teal hover:text-primary-foreground">Update Password</button>
        </Card>
      </form>
    </>
  );
}
