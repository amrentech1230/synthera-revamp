import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { Card, Empty } from "@/components/portal/shell";
import { createProductRequest, portalProduct } from "@/lib/portal.functions";
import { resolveAsset } from "@/lib/asset-map";
import { inputCls } from "@/components/site/public-ui";

export const Route = createFileRoute("/_authenticated/customer/products/$slug")({ component: Detail });

function Detail() {
  const { slug } = Route.useParams();
  const fn = useServerFn(portalProduct);
  const req = useServerFn(createProductRequest);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["portal-product", slug], queryFn: () => fn({ data: { slug } }) });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (!data) return <Empty text="Product not found." />;
  const { product: p, documents } = data;

  const onRequest = async () => {
    setBusy(true);
    try {
      await req({ data: { productId: p.id, message: msg || undefined } });
      toast.success("Request submitted");
      setMsg("");
      qc.invalidateQueries({ queryKey: ["my-requests"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  };

  const block = (t: string, v: string | null) =>
    v ? (<Card><h2 className="font-display text-lg font-semibold">{t}</h2><p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{v}</p></Card>) : null;

  return (
    <>
      <Link to="/customer/products" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-teal"><ArrowLeft className="size-4" /> Products</Link>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border bg-card"><img src={resolveAsset(p.images?.[0])} alt={p.name} className="aspect-square w-full object-cover" /></div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-teal">{p.category_name}</div>
          <h1 className="mt-2 font-display text-4xl font-semibold">{p.name}</h1>
          <p className="mt-4 text-muted-foreground">{p.short_desc}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-5 text-sm">
            <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">SKU</dt><dd className="mt-1 font-medium">{p.sku ?? "—"}</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Type</dt><dd className="mt-1 font-medium">{p.product_type}</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Therapeutic Area</dt><dd className="mt-1 font-medium">{p.category_name ?? "—"}</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Availability</dt><dd className="mt-1 font-medium">{p.availability}</dd></div>
          </dl>
          <div className="mt-6 rounded-xl border border-teal/30 bg-teal/5 p-5">
            <h2 className="font-semibold">Request Information</h2>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={2000} rows={3} placeholder="Optional message for our team" className={`${inputCls} mt-3`} />
            <button onClick={onRequest} disabled={busy} className="mt-3 w-full rounded-md bg-gradient-teal py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-50">
              {busy ? "Submitting…" : "Request Information"}
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {block("Overview", p.long_desc)}
        {block("Scientific Information", p.scientific_info)}
        {block("Therapeutic Area", p.therapeutic_info)}
        <Card>
          <h2 className="font-display text-lg font-semibold">Available Documentation</h2>
          <ul className="mt-4 space-y-3">
            {documents.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm">
                <span className="flex items-center gap-2"><FileText className="size-4 text-teal" />{d.title}<span className="text-xs text-muted-foreground">· {d.doc_type}</span></span>
                {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-teal"><Download className="size-3.5" /> Download</a>}
              </li>
            ))}
            {!documents.length && <li className="text-sm text-muted-foreground">No documents available yet.</li>}
          </ul>
        </Card>
      </div>
    </>
  );
}
