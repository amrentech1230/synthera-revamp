import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, ClipboardCheck, Factory, Scale, FileText, Workflow } from "lucide-react";
import { FeatureCard, PageHero, PartnerCta } from "@/components/site/public-ui";

export const Route = createFileRoute("/quality")({
  head: () => ({
    meta: [
      { title: "Quality — Synthera Therapeutics" },
      { name: "description", content: "Quality assurance, development standards, documentation and process integrity at Synthera." },
      { property: "og:title", content: "Quality — Synthera Therapeutics" },
      { property: "og:description", content: "Quality is built into every step." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QualityPage,
});

function QualityPage() {
  return (
    <>
      <PageHero eyebrow="Quality" title="Quality Is Built Into Every Step" intro="Quality is not a final checkpoint — it is designed into our research, development and documentation from the start." />
      <section className="py-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
          <FeatureCard icon={<ShieldCheck className="size-6" />} title="Quality Assurance" body="Systematic oversight to ensure consistent, reliable outcomes." />
          <FeatureCard delay={0.05} icon={<ClipboardCheck className="size-6" />} title="Development Standards" body="Defined criteria govern each stage of development." />
          <FeatureCard delay={0.1} icon={<Factory className="size-6" />} title="Manufacturing Standards" body="Controlled processes with verified inputs and outputs." />
          <FeatureCard delay={0.15} icon={<Scale className="size-6" />} title="Regulatory Considerations" body="Work is planned with applicable regulatory expectations in mind." />
          <FeatureCard delay={0.2} icon={<FileText className="size-6" />} title="Documentation" body="Complete, traceable records support every claim and decision." />
          <FeatureCard delay={0.25} icon={<Workflow className="size-6" />} title="Process Integrity" body="Validated, repeatable processes protect consistency." />
        </div>
      </section>
      <PartnerCta />
    </>
  );
}
