import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "./privacy";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({ meta: [{ title: "Disclaimer — Synthera Therapeutics" }] }),
  component: () => <PolicyPage title="Disclaimer" body={[
    ["FDA statement", "Statements regarding dietary supplements have not been evaluated by the Food and Drug Administration and are not intended to diagnose, treat, cure, or prevent any disease."],
    ["Research compounds", "Compounds in the Research Compounds category are sold strictly for laboratory and research purposes. They are not intended for human consumption, and may not be administered to humans or animals."],
    ["Medical advice", "Content on this site is for informational purposes only and does not constitute medical advice. Consult a qualified healthcare professional before beginning any new regimen."],
    ["Individual results", "Individual responses to supplements vary. Results described in product literature or testimonials are not guaranteed."],
  ]} />,
});
