import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/public-ui";
import { listResources } from "@/lib/public.functions";

const q = { queryKey: ["resources"], queryFn: () => listResources() };

export const Route = createFileRoute("/resources/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "Insights & Resources — Synthera Therapeutics" },
      { name: "description", content: "Research, scientific articles, company news and industry insights from Synthera." },
      { property: "og:title", content: "Insights & Resources — Synthera Therapeutics" },
      { property: "og:description", content: "Research, news and insights from Synthera." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => <div className="p-16 text-center">Could not load resources.</div>,
  component: ResourcesPage,
});

const CATS = ["All", "Research", "Scientific Articles", "Company News", "Industry Insights", "Educational Content"];

function ResourcesPage() {
  const { data } = useSuspenseQuery(q);
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? data : data.filter((r) => r.category === cat);
  return (
    <>
      <PageHero eyebrow="Resources" title="Insights & Resources" intro="Perspectives on research, science and the evolving therapeutic landscape." />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-1.5 text-sm transition ${cat === c ? "border-teal bg-teal text-primary-foreground" : "border-border hover:border-teal"}`}>{c}</button>
            ))}
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((r) => (
              <Link key={r.id} to="/resources/$slug" params={{ slug: r.slug }} className="group rounded-xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:border-teal/50">
                <div className="text-xs font-semibold uppercase tracking-wider text-teal">{r.category}</div>
                <h2 className="mt-3 font-display text-xl font-semibold group-hover:text-teal">{r.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{r.excerpt}</p>
                <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(r.published_at).toLocaleDateString()}</span>
                  <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-foreground">Read More <ArrowRight className="size-3.5" /></span>
                </div>
              </Link>
            ))}
            {!list.length && <p className="text-muted-foreground">No resources in this category yet.</p>}
          </div>
        </div>
      </section>
    </>
  );
}
