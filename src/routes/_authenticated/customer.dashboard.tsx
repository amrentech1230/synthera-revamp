import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Package, ClipboardList, FileText, Activity, ArrowRight } from "lucide-react";
import { Card, PageTitle, StatCard, StatusBadge, useMe } from "@/components/portal/shell";
import { allDocuments, myRequests, portalProducts } from "@/lib/portal.functions";
import { resolveAsset } from "@/lib/asset-map";

export const Route = createFileRoute("/_authenticated/customer/dashboard")({ component: Dashboard });

function Dashboard() {
  const { data: me } = useMe();
  const pf = useServerFn(portalProducts), rf = useServerFn(myRequests), df = useServerFn(allDocuments);
  const { data: products = [] } = useQuery({ queryKey: ["portal-products"], queryFn: () => pf() });
  const { data: requests = [] } = useQuery({ queryKey: ["my-requests"], queryFn: () => rf() });
  const { data: docs = [] } = useQuery({ queryKey: ["all-docs"], queryFn: () => df() });
  const first = me?.profile?.first_name || "there";

  return (
    <>
      <PageTitle title={`Welcome, ${first}`} subtitle="Your Synthera product portal overview." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Available Products" value={products.length} icon={Package} />
        <StatCard label="Pending Requests" value={requests.filter((r) => ["pending", "under_review"].includes(r.status)).length} icon={ClipboardList} />
        <StatCard label="Documents" value={docs.length} icon={FileText} />
        <StatCard label="Total Requests" value={requests.length} icon={Activity} />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recently Added Products</h2>
            <Link to="/customer/products" className="text-xs font-semibold uppercase tracking-wider text-teal">View all</Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {products.slice(0, 4).map((p) => (
              <Link key={p.id} to="/customer/products/$slug" params={{ slug: p.slug }} className="group flex gap-4 rounded-lg border border-border p-3 transition hover:border-teal/50">
                <img src={resolveAsset(p.images?.[0])} alt="" className="size-20 rounded-md object-cover" />
                <div className="min-w-0">
                  <div className="text-xs text-teal">{p.category_name}</div>
                  <div className="truncate font-semibold group-hover:text-teal">{p.name}</div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{p.short_desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-lg font-semibold">Recent Activity</h2>
          <ul className="mt-5 space-y-4">
            {requests.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0"><div className="truncate font-medium">{r.product_name}</div><div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div></div>
                <StatusBadge status={r.status} />
              </li>
            ))}
            {!requests.length && <li className="text-sm text-muted-foreground">No activity yet. Browse products and request information to get started.</li>}
          </ul>
          <Link to="/customer/products" className="mt-6 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-teal">Browse products <ArrowRight className="size-3.5" /></Link>
        </Card>
      </div>
    </>
  );
}
