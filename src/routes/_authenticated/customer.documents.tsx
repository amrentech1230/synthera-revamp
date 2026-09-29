import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, FileText } from "lucide-react";
import { Empty, PageTitle } from "@/components/portal/shell";
import { allDocuments } from "@/lib/portal.functions";

export const Route = createFileRoute("/_authenticated/customer/documents")({ component: Docs });

function Docs() {
  const fn = useServerFn(allDocuments);
  const { data = [], isLoading } = useQuery({ queryKey: ["all-docs"], queryFn: () => fn() });
  return (
    <>
      <PageTitle title="Documents" subtitle="Product information and technical documentation." />
      {!isLoading && !data.length ? (
        <Empty text="No documents have been published yet." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((d) => (
            <div key={d.id} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
              <FileText className="size-8 shrink-0 text-teal" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{d.title}</div>
                <div className="text-xs text-muted-foreground">{d.doc_type} · {d.product_name}</div>
                {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal"><Download className="size-3.5" /> Download</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
