import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "./privacy";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({ meta: [{ title: "Refund Policy — Synthera Therapeutics" }] }),
  component: () => <PolicyPage title="Refund Policy" body={[
    ["Returns window", "Unopened products may be returned within 30 days of delivery for a full refund less original shipping."],
    ["Opened products", "Opened products are eligible for store credit at our discretion if a quality concern is documented with photos and lot information."],
    ["How to start a return", "Email returns@syntheratherapeutics.com with your order number. We'll send a prepaid label for US orders."],
    ["Refund timing", "Refunds are processed to the original payment method within 5–10 business days of receiving the return."],
    ["Non-returnable items", "Reconstituted peptides, opened liquids, and final-sale items cannot be returned."],
  ]} />,
});
