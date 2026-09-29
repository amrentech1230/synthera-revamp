import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { PageTitle } from "@/components/portal/shell";
import { inputCls } from "@/components/site/public-ui";
import { adminCustomers } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/customers")({ component: Customers });

function Customers() {
  const fn = useServerFn(adminCustomers);
  const { data = [] } = useQuery({ queryKey: ["admin-customers"], queryFn: () => fn() });
  const [q, setQ] = useState("");
  const list = data.filter((c: any) => `${c.first_name ?? ""} ${c.last_name ?? ""} ${c.email} ${c.company ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageTitle title="Customers" subtitle={`${data.length} registered customers`} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" className={`${inputCls} mb-4 max-w-sm`} />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Company</th><th className="p-4">Country</th><th className="p-4">Joined</th></tr>
          </thead>
          <tbody>
            {list.map((c: any) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="p-4 font-medium">{[c.first_name, c.last_name].filter(Boolean).join(" ") || "—"}</td>
                <td className="p-4">{c.email || "—"}</td>
                <td className="p-4">{c.company ?? "—"}</td>
                <td className="p-4">{c.country ?? "—"}</td>
                <td className="p-4">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
