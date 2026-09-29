import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Empty, PageTitle, StatusBadge } from "@/components/portal/shell";
import { adminAccessRequests, setAccessStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/access-requests")({ component: Access });

function Access() {
  const fn = useServerFn(adminAccessRequests), set = useServerFn(setAccessStatus);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-access"], queryFn: () => fn() });
  const act = async (id: string, status: "approved" | "rejected") => {
    await set({ data: { id, status } });
    toast.success(`Request ${status}`);
    qc.invalidateQueries({ queryKey: ["admin-access"] });
  };
  return (
    <>
      <PageTitle title="Access Requests" subtitle="Review requests for portal access. Approved applicants can sign up to access the portal." />
      {!isLoading && !data.length ? <Empty text="No access requests yet." /> : (
        <div className="space-y-4">
          {data.map((a: any) => (
            <div key={a.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{a.first_name} {a.last_name} <span className="font-normal text-muted-foreground">· {a.job_title} at {a.company}</span></div>
                  <div className="text-sm text-muted-foreground">{a.email} {a.phone && `· ${a.phone}`} {a.country && `· ${a.country}`}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="mt-3 text-sm"><span className="font-medium">Reason:</span> {a.reason}</div>
              {a.message && <p className="mt-2 text-sm text-muted-foreground">{a.message}</p>}
              <div className="mt-4 flex items-center gap-2">
                <span className="mr-auto text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                <button onClick={() => act(a.id, "rejected")} className="rounded-md border border-border px-4 py-1.5 text-sm">Reject</button>
                <button onClick={() => act(a.id, "approved")} className="rounded-md bg-gradient-teal px-4 py-1.5 text-sm font-semibold text-primary-foreground">Approve</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
