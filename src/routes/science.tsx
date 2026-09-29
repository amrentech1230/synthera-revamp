import { createFileRoute } from "@tanstack/react-router";
import { Microscope, FlaskConical, Beaker, Lightbulb, GitBranch, Users } from "lucide-react";
import { FeatureCard, PageHero, PartnerCta, Reveal, SectionHead } from "@/components/site/public-ui";

export const Route = createFileRoute("/science")({
  head: () => ({
    meta: [
      { title: "Science & Research — Synthera Therapeutics" },
      { name: "description", content: "How Synthera approaches research, methodology, development and scientific collaboration." },
      { property: "og:title", content: "Science & Research — Synthera Therapeutics" },
      { property: "og:description", content: "The science behind Synthera's therapeutic innovation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SciencePage,
});

function SciencePage() {
  return (
    <>
      <PageHero eyebrow="Science & Research" title="Science Behind Our Innovation" intro="Our research is guided by rigorous methodology, open collaboration and a clear focus on therapeutic relevance." />
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow="Pillars" title="How We Do Science" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={<Microscope className="size-6" />} title="Scientific Research" body="Hypothesis-driven investigation of biological mechanisms and targets." />
            <FeatureCard delay={0.05} icon={<FlaskConical className="size-6" />} title="Therapeutic Development" body="Translating research findings into well-characterized candidates." />
            <FeatureCard delay={0.1} icon={<Beaker className="size-6" />} title="Research Methodology" body="Controlled, reproducible methods with transparent documentation." />
            <FeatureCard delay={0.15} icon={<Lightbulb className="size-6" />} title="Innovation" body="Exploring novel approaches where conventional methods fall short." />
            <FeatureCard delay={0.2} icon={<GitBranch className="size-6" />} title="Development Approach" body="Stage-gated progression with clear evidence requirements." />
            <FeatureCard delay={0.25} icon={<Users className="size-6" />} title="Scientific Collaboration" body="Working with academic and industry partners to accelerate insight." />
          </div>
        </div>
      </section>
      <section className="bg-secondary/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead center eyebrow="Pipeline" title="Research → Discovery → Development → Validation → Innovation" />
          <div className="mt-12 grid gap-4 md:grid-cols-5">
            {["Research", "Discovery", "Development", "Validation", "Therapeutic Innovation"].map((s, i) => (
              <Reveal key={s} delay={i * 0.08}>
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <div className="mx-auto grid size-10 place-items-center rounded-full bg-gradient-teal font-display text-primary-foreground">{i + 1}</div>
                  <div className="mt-4 font-display font-semibold">{s}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <PartnerCta />
    </>
  );
}
