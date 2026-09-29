import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Users, Package, UserPlus, ClipboardList, Inbox } from "lucide-react";
import { Card, PageTitle, StatCard, StatusBadge } from "@/components/portal/shell";
import { adminOverview } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({ component: AdminDash });

function AdminDash() {
  const fn = useServerFn(adminOverview);
  const { data } = useQuery({ queryKey: ["admin-overview"], queryFn: () => fn() });
  return (
    <>
      <PageTitle title="Admin Dashboard" subtitle="Portal activity at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Customers" value={data?.customers ?? "—"} icon={Users} />
        <StatCard label="Products" value={data?.products ?? "—"} icon={Package} />
        <StatCard label="Pending Access" value={data?.pendingAccess ?? "—"} icon={UserPlus} />
        <StatCard label="Pending Requests" value={data?.pendingRequests ?? "—"} icon={ClipboardList} />
        <StatCard label="New Inquiries" value={data?.inquiries ?? "—"} icon={Inbox} />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <Card>
          <div className="flex justify-between"><h2 className="font-display text-lg font-semibold">Recent Customers</h2><Link to="/admin/customers" className="text-xs font-semibold text-teal">All</Link></div>
          <ul className="mt-4 space-y-3 text-sm">
            {data?.recentCustomers.map((c: any) => (
              <li key={c.id} className="flex justify-between"><span>{[c.first_name, c.last_name].filter(Boolean).join(" ") || "Unnamed"}</span><span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span></li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="flex justify-between"><h2 className="font-display text-lg font-semibold">Recent Requests</h2><Link to="/admin/requests" className="text-xs font-semibold text-teal">All</Link></div>
          <ul className="mt-4 space-y-3 text-sm">
            {data?.recentRequests.map((r: any) => (
              <li key={r.id} className="flex items-center justify-between gap-2"><span className="truncate">{r.products?.name ?? "—"}</span><StatusBadge status={r.status} /></li>
            ))}
            {!data?.recentRequests.length && <li className="text-muted-foreground">None yet.</li>}
          </ul>
        </Card>
        <Card>
          <div className="flex justify-between"><h2 className="font-display text-lg font-semibold">Access Requests</h2><Link to="/admin/access-requests" className="text-xs font-semibold text-teal">All</Link></div>
          <ul className="mt-4 space-y-3 text-sm">
            {data?.recentAccess.map((a: any) => (
              <li key={a.id} className="flex justify-between"><span>{a.first_name} {a.last_name} · <span className="text-muted-foreground">{a.company}</span></span></li>
            ))}
            {!data?.recentAccess.length && <li className="text-muted-foreground">None yet.</li>}
          </ul>
        </Card>
      </div>
    </>
  );
}
