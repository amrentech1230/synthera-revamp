import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy public shop URL — products now live behind the customer portal.
export const Route = createFileRoute("/products")({
  beforeLoad: () => {
    throw redirect({ to: "/login", search: { redirect: "/customer/products" } });
  },
});
