import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mail, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { FormField, PageHero, inputCls } from "@/components/site/public-ui";
import { submitInquiry } from "@/lib/public.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Synthera Therapeutics" },
      { name: "description", content: "Connect with Synthera Therapeutics for general, partnership and scientific inquiries." },
      { property: "og:title", content: "Contact — Synthera Therapeutics" },
      { property: "og:description", content: "Connect with Synthera." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

const TYPES = ["General Inquiry", "Product Information", "Partnership", "Scientific Collaboration", "Business Development", "Other"];

function ContactPage() {
  const submit = useServerFn(submitInquiry);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setBusy(true);
    try {
      await submit({ data: f as any });
      toast.success("Thank you — your inquiry has been received.");
      form.reset();
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHero eyebrow="Contact" title="Connect With Synthera" intro="Whether you are exploring a partnership or have a scientific question, our team would like to hear from you." />
      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="space-y-6">
            {[[Mail, "Email", "info@synthera.example (placeholder)"], [MapPin, "Office", "Address to be confirmed"], [Clock, "Hours", "Mon–Fri, 9:00–17:00"]].map(([Icon, t, v]: any) => (
              <div key={t} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                <Icon className="size-5 text-teal" />
                <div><div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t}</div><div className="mt-1">{v}</div></div>
              </div>
            ))}
          </div>
          <form onSubmit={onSubmit} className="grid gap-5 rounded-xl border border-border bg-card p-6 sm:grid-cols-2 sm:p-10 lg:col-span-2">
            <FormField label="First Name" required><input name="first_name" required maxLength={80} className={inputCls} /></FormField>
            <FormField label="Last Name" required><input name="last_name" required maxLength={80} className={inputCls} /></FormField>
            <FormField label="Email" required><input name="email" type="email" required maxLength={255} className={inputCls} /></FormField>
            <FormField label="Organization"><input name="organization" maxLength={160} className={inputCls} /></FormField>
            <FormField label="Phone"><input name="phone" maxLength={40} className={inputCls} /></FormField>
            <FormField label="Inquiry Type" required>
              <select name="category" required className={inputCls} defaultValue="General Inquiry">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <div className="sm:col-span-2"><FormField label="Message" required><textarea name="message" required rows={6} maxLength={5000} className={inputCls} /></FormField></div>
            <button disabled={busy} className="rounded-md bg-gradient-teal px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-50 sm:col-span-2">
              {busy ? "Sending…" : "Submit Inquiry"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
