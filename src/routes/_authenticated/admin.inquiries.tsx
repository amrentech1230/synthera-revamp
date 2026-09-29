import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Empty, PageTitle } from "@/components/portal/shell";
import { adminInquiries, setInquiryStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/inquiries")({ component: Inq });

function Inq() {
  const fn = useServerFn(adminInquiries), set = useServerFn(setInquiryStatus);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-inq"], queryFn: () => fn() });
  return (
    <>
      <PageTitle title="Contact Inquiries" subtitle="Messages from the public contact form and portal support." />
      {!isLoading && !data.length ? <Empty text="No inquiries yet." /> : (
        <div className="space-y-4">
          {data.map((m: any) => (
            <div key={m.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{m.name} <span className="font-normal text-muted-foreground">· {m.email}</span></div>
                  <div className="text-xs text-muted-foreground">{m.category} {m.organization && `· ${m.organization}`} · {new Date(m.created_at).toLocaleString()}</div>
                </div>
                <select value={m.status} onChange={async (e) => { await set({ data: { id: m.id, status: e.target.value as any } }); qc.invalidateQueries({ queryKey: ["admin-inq"] }); }} className="rounded-md border border-input bg-background px-2 py-1 text-sm">
                  <option value="new">New</option><option value="in_progress">In progress</option><option value="closed">Closed</option>
                </select>
              </div>
              {m.subject && m.subject !== m.category && <div className="mt-3 font-medium">{m.subject}</div>}
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
