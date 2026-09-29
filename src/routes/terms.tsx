import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "./privacy";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — Synthera Therapeutics" }] }),
  component: () => <PolicyPage title="Terms & Conditions" body={[
    ["Acceptance", "By accessing this site or placing an order you agree to these terms."],
    ["Eligibility", "You must be at least 18 years old. Research compounds are sold for laboratory and research use only — not for human consumption."],
    ["Pricing & availability", "Prices and availability are subject to change without notice. We reserve the right to limit quantities."],
    ["Intellectual property", "All content on this site is the property of Synthera Therapeutics or its licensors."],
    ["Limitation of liability", "To the maximum extent permitted by law, Synthera shall not be liable for any indirect, incidental, or consequential damages."],
    ["Governing law", "These terms are governed by the laws of the State of California, USA."],
  ]} />,
});
