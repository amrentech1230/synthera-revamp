import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Search } from "lucide-react";
import { Empty, PageTitle } from "@/components/portal/shell";
import { portalCategories, portalProducts } from "@/lib/portal.functions";
import { resolveAsset } from "@/lib/asset-map";
import { inputCls } from "@/components/site/public-ui";

export const Route = createFileRoute("/_authenticated/customer/products/")({
  validateSearch: z.object({ q: z.string().optional() }),
  component: Catalog,
});

function Catalog() {
  const search = Route.useSearch();
  const pf = useServerFn(portalProducts), cf = useServerFn(portalCategories);
  const { data: products = [], isLoading } = useQuery({ queryKey: ["portal-products"], queryFn: () => pf() });
  const { data: cats = [] } = useQuery({ queryKey: ["portal-cats"], queryFn: () => cf() });
  const [q, setQ] = useState(search.q ?? "");
  const [area, setArea] = useState("");
  const [type, setType] = useState("");
  const [avail, setAvail] = useState("");
  const [sort, setSort] = useState("newest");
  const types = [...new Set(products.map((p) => p.product_type))];
  const avails = [...new Set(products.map((p) => p.availability))];

  const list = useMemo(() => {
    let l = products.filter(
      (p) =>
        (!q || `${p.name} ${p.short_desc ?? ""} ${p.sku ?? ""}`.toLowerCase().includes(q.toLowerCase())) &&
        (!area || p.category_id === area) && (!type || p.product_type === type) && (!avail || p.availability === avail),
    );
    if (sort === "az") l = [...l].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "za") l = [...l].sort((a, b) => b.name.localeCompare(a.name));
    return l;
  }, [products, q, area, type, avail, sort]);

  return (
    <>
      <PageTitle title="Products" subtitle="Browse the Synthera product catalog." />
      <div className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." className={`${inputCls} pl-9`} />
        </div>
        <select value={area} onChange={(e) => setArea(e.target.value)} className={inputCls}>
          <option value="">All therapeutic areas</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
          <option value="">All product types</option>
          {types.map((t) => <option key={t}>{t}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <select value={avail} onChange={(e) => setAvail(e.target.value)} className={inputCls}>
            <option value="">Availability</option>
            {avails.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={inputCls}>
            <option value="newest">Newest</option><option value="az">Name A-Z</option><option value="za">Name Z-A</option>
          </select>
        </div>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {list.map((p) => (
          <div key={p.id} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1 hover:border-teal/50">
            <div className="aspect-[4/3] overflow-hidden bg-muted"><img src={resolveAsset(p.images?.[0])} alt={p.name} loading="lazy" className="size-full object-cover transition group-hover:scale-105" /></div>
            <div className="flex flex-1 flex-col p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-teal">{p.category_name ?? "General"}</div>
              <h3 className="mt-1 font-display text-lg font-semibold">{p.name}</h3>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{p.short_desc}</p>
              <Link to="/customer/products/$slug" params={{ slug: p.slug }} className="mt-4 rounded-md border border-teal py-2 text-center text-sm font-semibold text-teal transition hover:bg-teal hover:text-primary-foreground">View Details</Link>
            </div>
          </div>
        ))}
      </div>
      {!isLoading && !list.length && <div className="mt-6"><Empty text="No products match your filters." /></div>}
    </>
  );
}
