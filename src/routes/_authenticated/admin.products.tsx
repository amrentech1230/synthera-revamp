import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Pencil, Archive, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Card, PageTitle, StatusBadge } from "@/components/portal/shell";
import { FormField, inputCls } from "@/components/site/public-ui";
import { addProductDoc, adminProductDocs, adminProducts, deleteProductDoc, saveProduct, setProductStatus } from "@/lib/admin.functions";
import { portalCategories } from "@/lib/portal.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/products")({ component: AdminProducts });

function AdminProducts() {
  const fn = useServerFn(adminProducts);
  const status = useServerFn(setProductStatus);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-products"], queryFn: () => fn() });
  const [editing, setEditing] = useState<any | null>(null);

  const setS = async (id: string, s: "active" | "archived" | "draft") => {
    await status({ data: { id, status: s } });
    toast.success(`Product ${s}`);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <>
      <PageTitle title="Products" subtitle="Manage the product catalog visible to portal customers."
        action={<button onClick={() => setEditing({})} className="inline-flex items-center gap-2 rounded-md bg-gradient-teal px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Plus className="size-4" /> Add Product</button>} />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Status</th><th className="p-4">Created</th><th className="p-4">Updated</th><th className="p-4 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {data.map((p: any) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-4"><div className="font-medium">{p.name}</div><div className="font-mono text-xs text-muted-foreground">{p.sku}</div></td>
                <td className="p-4">{p.categories?.name ?? "—"}</td>
                <td className="p-4"><StatusBadge status={p.status} /></td>
                <td className="p-4">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="p-4">{new Date(p.updated_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setEditing(p)} className="rounded p-2 hover:bg-muted" aria-label="Edit"><Pencil className="size-4" /></button>
                    {p.status !== "archived" ? (
                      <button onClick={() => setS(p.id, "archived")} className="rounded p-2 hover:bg-muted" aria-label="Archive"><Archive className="size-4" /></button>
                    ) : (
                      <button onClick={() => setS(p.id, "active")} className="rounded px-2 text-xs font-semibold text-teal hover:bg-muted">Restore</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <ProductEditor product={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function ProductEditor({ product, onClose }: { product: any; onClose: () => void }) {
  const save = useServerFn(saveProduct);
  const cf = useServerFn(portalCategories);
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery({ queryKey: ["portal-cats"], queryFn: () => cf() });
  const [busy, setBusy] = useState(false);
  const [id, setId] = useState<string | undefined>(product.id);

  const submit = async (form: HTMLFormElement, status: "draft" | "active") => {
    const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (!f.name?.trim()) return toast.error("Product name is required");
    setBusy(true);
    try {
      const n = (k: string) => (f[k]?.trim() ? f[k].trim() : null);
      const r = await save({
        data: {
          id, name: f.name, sku: n("sku"), category_id: n("category_id"), product_type: f.product_type || "Research Compound",
          availability: f.availability || "Available", short_desc: n("short_desc"), long_desc: n("long_desc"),
          scientific_info: n("scientific_info"), therapeutic_info: n("therapeutic_info"), image_url: n("image_url"),
          status: product.status === "archived" && status === "active" ? "active" : status,
        },
      });
      setId(r.id);
      toast.success(status === "active" ? "Product published" : "Draft saved");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["portal-products"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/50" onClick={onClose}>
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-background p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">{id ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="rounded p-2 hover:bg-muted"><X className="size-5" /></button>
        </div>
        <form id="pform" onSubmit={(e) => e.preventDefault()} className="mt-6 space-y-6">
          <section className="grid gap-4 sm:grid-cols-2">
            <h3 className="font-semibold sm:col-span-2">Basic Information</h3>
            <FormField label="Product Name" required><input name="name" defaultValue={product.name} className={inputCls} /></FormField>
            <FormField label="Product Code / SKU"><input name="sku" defaultValue={product.sku ?? ""} className={inputCls} /></FormField>
            <FormField label="Therapeutic Area">
              <select name="category_id" defaultValue={product.category_id ?? ""} className={inputCls}>
                <option value="">—</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Product Type"><input name="product_type" defaultValue={product.product_type ?? "Research Compound"} className={inputCls} /></FormField>
            <FormField label="Availability">
              <select name="availability" defaultValue={product.availability ?? "Available"} className={inputCls}>
                {["Available", "Limited", "On Request", "Unavailable"].map((a) => <option key={a}>{a}</option>)}
              </select>
            </FormField>
            <FormField label="Product Image URL"><input name="image_url" defaultValue={product.images?.[0] ?? ""} className={inputCls} /></FormField>
            <div className="sm:col-span-2"><FormField label="Short Description"><textarea name="short_desc" rows={2} defaultValue={product.short_desc ?? ""} className={inputCls} /></FormField></div>
            <div className="sm:col-span-2"><FormField label="Full Description / Overview"><textarea name="long_desc" rows={4} defaultValue={product.long_desc ?? ""} className={inputCls} /></FormField></div>
          </section>
          <section className="grid gap-4">
            <h3 className="font-semibold">Scientific Information</h3>
            <FormField label="Scientific Information"><textarea name="scientific_info" rows={4} defaultValue={product.scientific_info ?? ""} className={inputCls} /></FormField>
            <FormField label="Therapeutic Information"><textarea name="therapeutic_info" rows={3} defaultValue={product.therapeutic_info ?? ""} className={inputCls} /></FormField>
          </section>
        </form>
        {id ? <DocsManager productId={id} /> : <p className="mt-6 text-sm text-muted-foreground">Save the product first to upload documents.</p>}
        <div className="sticky bottom-0 mt-8 flex gap-3 border-t border-border bg-background py-4">
          <button disabled={busy} onClick={() => submit(document.getElementById("pform") as HTMLFormElement, "draft")} className="flex-1 rounded-md border border-border py-3 text-sm font-semibold">Save Draft</button>
          <button disabled={busy} onClick={() => submit(document.getElementById("pform") as HTMLFormElement, "active")} className="flex-1 rounded-md bg-gradient-teal py-3 text-sm font-semibold text-primary-foreground">Publish Product</button>
        </div>
      </div>
    </div>
  );
}

function DocsManager({ productId }: { productId: string }) {
  const list = useServerFn(adminProductDocs), add = useServerFn(addProductDoc), del = useServerFn(deleteProductDoc);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-docs", productId], queryFn: () => list({ data: { productId } }) });
  const [type, setType] = useState("Product Information");
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      const path = `${productId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from("product-docs").upload(path, file);
      if (error) throw error;
      await add({ data: { productId, title: file.name, doc_type: type, file_path: path } });
      qc.invalidateQueries({ queryKey: ["admin-docs", productId] });
      toast.success("Document uploaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mt-6">
      <h3 className="font-semibold">Documents</h3>
      <div className="mt-4 flex flex-wrap gap-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className={`${inputCls} max-w-xs`}>
          {["Product Information", "Technical Documentation", "Supporting Document"].map((t) => <option key={t}>{t}</option>)}
        </select>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-teal px-4 py-2 text-sm font-semibold text-teal">
          <Upload className="size-4" /> {busy ? "Uploading…" : "Upload file"}
          <input type="file" className="hidden" disabled={busy} onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {data.map((d: any) => (
          <li key={d.id} className="flex items-center justify-between rounded border border-border p-2">
            <span>{d.title} <span className="text-xs text-muted-foreground">· {d.doc_type}</span></span>
            <button onClick={async () => { await del({ data: { id: d.id } }); qc.invalidateQueries({ queryKey: ["admin-docs", productId] }); }} className="rounded p-1 text-destructive hover:bg-muted"><Trash2 className="size-4" /></button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
