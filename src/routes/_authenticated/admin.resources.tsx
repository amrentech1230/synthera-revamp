import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PageTitle, StatusBadge } from "@/components/portal/shell";
import { FormField, inputCls } from "@/components/site/public-ui";
import { adminResources, deleteResource, saveResource } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/resources")({ component: Res });

const CATS = ["Research", "Scientific Articles", "Company News", "Industry Insights", "Educational Content"];

function Res() {
  const fn = useServerFn(adminResources), save = useServerFn(saveResource), del = useServerFn(deleteResource);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-res"], queryFn: () => fn() });
  const [editing, setEditing] = useState<any | null>(null);

  const onSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      await save({ data: { id: editing.id, title: f.title, category: f.category, excerpt: f.excerpt || null, body: f.body || null, published: f.published === "on" } });
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-res"] });
      qc.invalidateQueries({ queryKey: ["resources"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed");
    }
  };

  return (
    <>
      <PageTitle title="Resources" subtitle="Public insights and articles."
        action={<button onClick={() => setEditing({ published: true })} className="inline-flex items-center gap-2 rounded-md bg-gradient-teal px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Plus className="size-4" /> Add Resource</button>} />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-4">Title</th><th className="p-4">Category</th><th className="p-4">Status</th><th className="p-4">Date</th><th className="p-4 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {data.map((r: any) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="p-4 font-medium">{r.title}</td>
                <td className="p-4">{r.category}</td>
                <td className="p-4"><StatusBadge status={r.published ? "active" : "draft"} /></td>
                <td className="p-4">{new Date(r.published_at).toLocaleDateString()}</td>
                <td className="p-4"><div className="flex justify-end gap-1">
                  <button onClick={() => setEditing(r)} className="rounded p-2 hover:bg-muted"><Pencil className="size-4" /></button>
                  <button onClick={async () => { if (confirm("Delete this resource?")) { await del({ data: { id: r.id } }); qc.invalidateQueries({ queryKey: ["admin-res"] }); } }} className="rounded p-2 text-destructive hover:bg-muted"><Trash2 className="size-4" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink/50" onClick={() => setEditing(null)}>
          <form onSubmit={onSave} onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-xl space-y-4 overflow-y-auto bg-background p-6 sm:p-8">
            <div className="flex items-center justify-between"><h2 className="font-display text-2xl font-semibold">{editing.id ? "Edit" : "New"} Resource</h2><button type="button" onClick={() => setEditing(null)}><X className="size-5" /></button></div>
            <FormField label="Title" required><input name="title" required defaultValue={editing.title} className={inputCls} /></FormField>
            <FormField label="Category"><select name="category" defaultValue={editing.category ?? CATS[0]} className={inputCls}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></FormField>
            <FormField label="Excerpt"><textarea name="excerpt" rows={2} defaultValue={editing.excerpt ?? ""} className={inputCls} /></FormField>
            <FormField label="Body"><textarea name="body" rows={12} defaultValue={editing.body ?? ""} className={inputCls} /></FormField>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={editing.published} /> Published</label>
            <button className="w-full rounded-md bg-gradient-teal py-3 text-sm font-semibold text-primary-foreground">Save</button>
          </form>
        </div>
      )}
    </>
  );
}
