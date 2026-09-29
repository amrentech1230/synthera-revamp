import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type ReactNode, type ComponentType } from "react";
import { Bell, LogOut, Menu, X, Search, Shield, User } from "lucide-react";
import logo from "@/assets/synthera-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { getMe } from "@/lib/portal.functions";

export type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }> };

export function useMe() {
  const fn = useServerFn(getMe);
  return useQuery({ queryKey: ["me"], queryFn: () => fn() });
}

export function PortalShell({ title, nav, children, variant }: { title: string; nav: NavItem[]; children: ReactNode; variant: "customer" | "admin" }) {
  const [open, setOpen] = useState(false);
  const { data: me } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const name = [me?.profile?.first_name, me?.profile?.last_name].filter(Boolean).join(" ") || me?.email || "Account";

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-ink text-background">
      <Link to="/" className="flex items-center gap-3 border-b border-background/10 px-6 py-5">
        <img src={logo} alt="Synthera" className="h-9 w-auto" />
        <div>
          <div className="font-display text-sm font-semibold tracking-wider">SYNTHERA</div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-teal-glow">{title}</div>
        </div>
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-background/70 transition hover:bg-background/5 hover:text-background"
            activeProps={{ className: "bg-teal/20 text-background" }}
          >
            <n.icon className="size-4" /> {n.label}
          </Link>
        ))}
      </nav>
      <div className="space-y-1 border-t border-background/10 p-4">
        {me?.isAdmin && (
          <Link to={variant === "admin" ? "/customer/dashboard" : "/admin/dashboard"} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-background/70 hover:bg-background/5">
            {variant === "admin" ? <User className="size-4" /> : <Shield className="size-4" />}
            {variant === "admin" ? "Customer view" : "Admin portal"}
          </Link>
        )}
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-background/70 hover:bg-background/5">
          <LogOut className="size-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-72">{sidebar}</aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <button className="rounded-md p-2 hover:bg-muted lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="relative hidden max-w-sm flex-1 md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && variant === "customer")
                  navigate({ to: "/customer/products", search: { q: (e.target as HTMLInputElement).value } as any });
              }}
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm focus:border-teal focus:outline-none"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="Notifications"><Bell className="size-5" /></button>
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-full bg-gradient-teal text-sm font-semibold text-primary-foreground">
                {name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium sm:block">{name}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon }: { label: string; value: ReactNode; icon: ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="size-5 text-teal" />
      </div>
      <div className="mt-3 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}

const STATUS_CLS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  new: "bg-teal/15 text-teal",
  under_review: "bg-accent text-accent-foreground",
  in_progress: "bg-accent text-accent-foreground",
  approved: "bg-teal/15 text-teal",
  active: "bg-teal/15 text-teal",
  completed: "bg-primary/15 text-primary",
  closed: "bg-muted text-muted-foreground",
  draft: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground line-through",
  rejected: "bg-destructive/15 text-destructive",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_CLS[status] ?? "bg-muted"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-card p-6 ${className}`}>{children}</div>;
}

export function Empty({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">{text}</div>;
}
