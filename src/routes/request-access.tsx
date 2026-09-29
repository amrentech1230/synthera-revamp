import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { FormField, PageHero, inputCls } from "@/components/site/public-ui";
import { submitAccessRequest } from "@/lib/public.functions";

export const Route = createFileRoute("/request-access")({
  head: () => ({
    meta: [
      { title: "Request Access — Synthera Therapeutics" },
      { name: "description", content: "Request access to the secure Synthera product portal." },
      { property: "og:title", content: "Request Access — Synthera Therapeutics" },
      { property: "og:description", content: "Apply for access to the Synthera product portal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RequestAccess,
});

const REASONS = ["Research purposes", "Clinical / healthcare professional", "Distribution partner", "Business development", "Other"];

function RequestAccess() {
  const submit = useServerFn(submitAccessRequest);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true);
    try {
      await submit({ data: f as any });
      setDone(true);
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHero eyebrow="Product Portal" title="Request Access to the Synthera Product Portal" intro="Complete the form below. Our team will review your request and follow up by email." />
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-8 flex flex-col items-center gap-3 rounded-xl border border-teal/30 bg-teal/5 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm text-muted-foreground">Already know you want in? Create your account and get started right away.</p>
            <Link to="/signup" className="inline-flex shrink-0 items-center gap-2 rounded-md bg-gradient-teal px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:opacity-95">
              Get Started
            </Link>
          </div>
          {done ? (
            <div className="rounded-xl border border-teal/40 bg-teal/5 p-10 text-center">
              <CheckCircle2 className="mx-auto size-12 text-teal" />
              <p className="mt-4 font-display text-xl">Thank you. Your access request has been submitted and is pending review.</p>
              <p className="mt-3 text-sm text-muted-foreground">Want to get started now? You can also <Link to="/signup" className="text-teal underline">create an account</Link>.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-5 rounded-xl border border-border bg-card p-6 sm:grid-cols-2 sm:p-10">
              <FormField label="First Name" required><input name="first_name" required maxLength={80} className={inputCls} /></FormField>
              <FormField label="Last Name" required><input name="last_name" required maxLength={80} className={inputCls} /></FormField>
              <FormField label="Company" required><input name="company" required maxLength={160} className={inputCls} /></FormField>
              <FormField label="Job Title"><input name="job_title" maxLength={120} className={inputCls} /></FormField>
              <FormField label="Business Email" required><input name="email" type="email" required maxLength={255} className={inputCls} /></FormField>
              <FormField label="Phone"><input name="phone" maxLength={40} className={inputCls} /></FormField>
              <FormField label="Country"><input name="country" maxLength={80} className={inputCls} /></FormField>
              <FormField label="Reason for Access" required>
                <select name="reason" required className={inputCls} defaultValue="">
                  <option value="" disabled>Select…</option>
                  {REASONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </FormField>
              <div className="sm:col-span-2"><FormField label="Message"><textarea name="message" rows={5} maxLength={2000} className={inputCls} /></FormField></div>
              <button disabled={busy} className="rounded-md bg-gradient-teal px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-50 sm:col-span-2">
                {busy ? "Submitting…" : "Submit Access Request"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
