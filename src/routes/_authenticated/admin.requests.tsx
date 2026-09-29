import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Empty, PageTitle } from "@/components/portal/shell";
import { adminProductRequests, setRequestStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/requests")({ component: Reqs });

const STATUSES = ["pending", "under_review", "approved", "completed", "rejected"] as const;

function Reqs() {
  const fn = useServerFn(adminProductRequests), set = useServerFn(setRequestStatus);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-reqs"], queryFn: () => fn() });
  const change = async (id: string, status: (typeof STATUSES)[number]) => {
    await set({ data: { id, status } });
    toast.success("Status updated");
    qc.invalidateQueries({ queryKey: ["admin-reqs"] });
  };
  return (
    <>
      <PageTitle title="Orders / Requests" subtitle="Customer product information requests." />
      {!isLoading && !data.length ? <Empty text="No requests yet." /> : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-4">ID</th><th className="p-4">Product</th><th className="p-4">Message</th><th className="p-4">Date</th><th className="p-4">Status</th></tr>
            </thead>
            <tbody>
              {data.map((r: any) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-mono text-xs">{r.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4 font-medium">{r.products?.name ?? "—"}</td>
                  <td className="max-w-xs truncate p-4 text-muted-foreground">{r.message ?? "—"}</td>
                  <td className="p-4">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <select value={r.status} onChange={(e) => change(r.id, e.target.value as any)} className="rounded-md border border-input bg-background px-2 py-1 text-sm capitalize">
                      {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
