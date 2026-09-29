import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getResource } from "@/lib/public.functions";
import { PartnerCta } from "@/components/site/public-ui";

export const Route = createFileRoute("/resources/$slug")({
  loader: async ({ params }) => {
    const r = await getResource({ data: { slug: params.slug } });
    if (!r) throw notFound();
    return r;
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.title} — Synthera Therapeutics` },
            { name: "description", content: loaderData.excerpt ?? loaderData.title },
            { property: "og:title", content: loaderData.title },
            { property: "og:description", content: loaderData.excerpt ?? loaderData.title },
            { property: "og:type", content: "article" },
            { name: "twitter:card", content: "summary_large_image" },
          ],
        }
      : { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] },
  notFoundComponent: () => (
    <div className="p-24 text-center">
      <p>Resource not found.</p>
      <Link to="/resources" className="mt-4 inline-block text-teal">Back to resources</Link>
    </div>
  ),
  errorComponent: () => <div className="p-24 text-center">Could not load this resource.</div>,
  component: ResourceDetail,
});

function ResourceDetail() {
  const r = Route.useLoaderData();
  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <Link to="/resources" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-teal"><ArrowLeft className="size-4" /> All resources</Link>
        <div className="mt-8 text-xs font-semibold uppercase tracking-wider text-teal">{r.category}</div>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">{r.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{new Date(r.published_at).toLocaleDateString()}</p>
        {r.excerpt && <p className="mt-8 text-xl leading-relaxed text-foreground/80">{r.excerpt}</p>}
        <div className="mt-8 space-y-5 leading-relaxed text-foreground/80">
          {(r.body ?? "").split(/\n+|\\n/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </article>
      <PartnerCta />
    </>
  );
}
