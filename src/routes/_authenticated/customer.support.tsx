import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Card, PageTitle } from "@/components/portal/shell";
import { FormField, inputCls } from "@/components/site/public-ui";
import { submitSupport } from "@/lib/portal.functions";

export const Route = createFileRoute("/_authenticated/customer/support")({ component: Support });

const TOPICS = ["Contact Support", "Product Question", "Document Request", "Account Help", "General Inquiry"];

function Support() {
  const fn = useServerFn(submitSupport);
  const [busy, setBusy] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setBusy(true);
    try {
      await fn({ data: f as any });
      toast.success("Message sent — our team will respond by email.");
      form.reset();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle title="How Can We Help?" subtitle="Send a message to the Synthera support team." />
      <Card className="max-w-3xl">
        <form onSubmit={onSubmit} className="grid gap-4">
          <FormField label="Topic" required>
            <select name="topic" className={inputCls}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select>
          </FormField>
          <FormField label="Subject" required><input name="subject" required maxLength={200} className={inputCls} /></FormField>
          <FormField label="Message" required><textarea name="message" required rows={6} maxLength={5000} className={inputCls} /></FormField>
          <button disabled={busy} className="rounded-md bg-gradient-teal px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-50">{busy ? "Sending…" : "Send Message"}</button>
        </form>
      </Card>
    </>
  );
}
