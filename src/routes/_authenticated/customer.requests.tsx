import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Empty, PageTitle, StatusBadge } from "@/components/portal/shell";
import { myRequests } from "@/lib/portal.functions";

export const Route = createFileRoute("/_authenticated/customer/requests")({ component: Requests });

function Requests() {
  const fn = useServerFn(myRequests);
  const { data = [], isLoading } = useQuery({ queryKey: ["my-requests"], queryFn: () => fn() });
  return (
    <>
      <PageTitle title="My Requests" subtitle="Track the status of your product information requests." />
      {!isLoading && !data.length ? (
        <Empty text="You have not submitted any requests yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-4">Request ID</th><th className="p-4">Product</th><th className="p-4">Date</th><th className="p-4">Status</th><th className="p-4">Last Updated</th><th className="p-4">Action</th></tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-mono text-xs">{r.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4 font-medium">{r.product_name}</td>
                  <td className="p-4">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="p-4"><StatusBadge status={r.status} /></td>
                  <td className="p-4">{new Date(r.updated_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    {r.product_slug && <Link to="/customer/products/$slug" params={{ slug: r.product_slug }} className="text-xs font-semibold text-teal">View Request</Link>}
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
