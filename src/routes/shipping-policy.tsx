import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "./privacy";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({ meta: [{ title: "Shipping Policy — Synthera Therapeutics" }] }),
  component: () => <PolicyPage title="Shipping Policy" body={[
    ["Processing time", "Orders placed before 2pm PT on business days ship the same day. Otherwise, orders ship the next business day."],
    ["Domestic shipping (US)", "Standard (3–5 business days) — $7.95 · Express (1–2 business days) — $19.95 · Free standard shipping on orders over $100."],
    ["International shipping", "DHL Express to most countries (5–10 business days) — $39.95. Customs duties and taxes are the responsibility of the recipient."],
    ["Cold-chain shipments", "Temperature-sensitive products ship with insulated packaging and gel packs. Order before 12pm PT Monday–Wednesday for best transit times."],
    ["Tracking", "All shipments include tracked delivery. Tracking links are sent via email upon dispatch."],
    ["Restricted destinations", "Some research compounds are restricted by region. Restricted items will be flagged at checkout."],
  ]} />,
});
