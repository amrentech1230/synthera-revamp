import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { LayoutDashboard, Package, Users, UserPlus, ClipboardList, BookOpen, Inbox } from "lucide-react";
import { PortalShell, type NavItem } from "@/components/portal/shell";
import { getMe } from "@/lib/portal.functions";

const NAV: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/access-requests", label: "Access Requests", icon: UserPlus },
  { to: "/admin/requests", label: "Orders / Requests", icon: ClipboardList },
  { to: "/admin/resources", label: "Resources", icon: BookOpen },
  { to: "/admin/inquiries", label: "Contact Inquiries", icon: Inbox },
];

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const me = await getMe();
    if (!me.isAdmin) throw redirect({ to: "/customer/dashboard" });
  },
  head: () => ({ meta: [{ title: "Admin Portal — Synthera" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <PortalShell title="Admin Portal" nav={NAV} variant="admin">
      <Outlet />
    </PortalShell>
  ),
});
