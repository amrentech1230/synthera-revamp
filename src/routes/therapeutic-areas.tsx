import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { PageHero, PartnerCta, Reveal } from "@/components/site/public-ui";
import { THERAPEUTIC_AREAS } from "@/lib/site-content";

export const Route = createFileRoute("/therapeutic-areas")({
  head: () => ({
    meta: [
      { title: "Therapeutic Areas — Synthera Therapeutics" },
      { name: "description", content: "The broad therapeutic areas that guide Synthera's scientific focus." },
      { property: "og:title", content: "Therapeutic Areas — Synthera Therapeutics" },
      { property: "og:description", content: "Our therapeutic focus areas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AreasPage,
});

function AreasPage() {
  return (
    <>
      <PageHero eyebrow="Therapeutic Areas" title="Our Therapeutic Focus" intro="Broad areas of scientific interest where we believe rigorous research can make a meaningful difference." />
      <section className="py-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
          {THERAPEUTIC_AREAS.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.06}>
              <div className="h-full rounded-xl border border-border bg-card p-8">
                <a.icon className="size-9 text-teal" />
                <h2 className="mt-5 font-display text-2xl font-semibold">{a.title}</h2>
                <p className="mt-3 text-muted-foreground">{a.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mx-auto mt-14 max-w-3xl rounded-xl border border-teal/30 bg-teal/5 p-6 text-center">
          <Lock className="mx-auto size-6 text-teal" />
          <p className="mt-3 text-sm text-muted-foreground">Specific product information is available only to authorized users.</p>
          <Link to="/login" className="mt-4 inline-block text-sm font-semibold uppercase tracking-wider text-teal hover:underline">Login to View Products</Link>
        </div>
      </section>
      <PartnerCta />
    </>
  );
}
