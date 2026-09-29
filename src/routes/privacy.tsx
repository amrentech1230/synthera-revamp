import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Synthera Therapeutics" }] }),
  component: () => <PolicyPage title="Privacy Policy" body={[
    ["Information we collect", "We collect contact information you provide (name, email, phone, address), payment details processed by our PCI-DSS compliant providers, and usage data via standard cookies and analytics."],
    ["How we use your data", "To process orders, deliver products, send transactional and (with consent) marketing communications, and improve our services."],
    ["Sharing", "We share data only with vetted service providers (payment, shipping, analytics) under strict data-processing agreements. We do not sell personal data."],
    ["Your rights", "You may request access, correction, deletion, or portability of your data. Contact privacy@syntheratherapeutics.com."],
    ["Security", "TLS in transit, encrypted at rest, role-based access controls, and continuous monitoring."],
    ["Updates", "We may update this policy. Material changes will be communicated by email or in-product notice."],
  ]} />,
});

export function PolicyPage({ title, body }: { title: string; body: [string, string][] }) {
  return (
    <>
      <section className="border-b border-border bg-secondary/40 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-teal">Legal</div>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated May 2026</p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {body.map(([h, p]) => (
            <div key={h}>
              <h2 className="font-display text-xl font-semibold">{h}</h2>
              <p className="mt-3 leading-relaxed text-foreground/80">{p}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
