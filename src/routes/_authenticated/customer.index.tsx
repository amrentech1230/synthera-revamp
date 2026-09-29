import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/customer/")({
  beforeLoad: () => {
    throw redirect({ to: "/customer/dashboard" });
  },
});
