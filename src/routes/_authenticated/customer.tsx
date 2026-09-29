import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Package, ClipboardList, FileText, User, LifeBuoy } from "lucide-react";
import { PortalShell, type NavItem } from "@/components/portal/shell";

const NAV: NavItem[] = [
  { to: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customer/products", label: "Products", icon: Package },
  { to: "/customer/requests", label: "Orders / Requests", icon: ClipboardList },
  { to: "/customer/documents", label: "Documents", icon: FileText },
  { to: "/customer/profile", label: "Profile", icon: User },
  { to: "/customer/support", label: "Support", icon: LifeBuoy },
];

export const Route = createFileRoute("/_authenticated/customer")({
  head: () => ({ meta: [{ title: "Customer Portal — Synthera" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <PortalShell title="Customer Portal" nav={NAV} variant="customer">
      <Outlet />
    </PortalShell>
  ),
});
