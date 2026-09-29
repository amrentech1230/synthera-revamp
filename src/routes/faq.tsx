import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — Synthera Therapeutics" }, { name: "description", content: "Answers about quality, shipping, payment, returns, and product storage." }] }),
  component: FAQPage,
});

const SECTIONS = [
  {
    title: "Products",
    items: [
      ["What are peptides?", "Peptides are short chains of amino acids that act as biological messengers. Synthera supplies high-purity research-grade peptides for laboratory and research applications."],
      ["Are your products lab tested?", "Yes — every batch undergoes independent third-party HPLC and mass-spectrometry analysis. COAs are available with each shipment."],
      ["How should I store products?", "Lyophilized vials remain stable at room temperature for 18–24 months when sealed. Reconstituted peptides should be refrigerated and used within 30 days."],
    ],
  },
  {
    title: "Shipping & delivery",
    items: [
      ["How fast do orders ship?", "Orders placed before 2pm PT ship same-day. After 2pm, orders ship the next business day."],
      ["Do you ship internationally?", "Yes — DHL Express to most countries, typically 5–10 business days. Some research compounds are restricted by region."],
      ["Is shipping discreet?", "All packaging is plain and unlabeled. Tracking information is sent via email."],
    ],
  },
  {
    title: "Payments & refunds",
    items: [
      ["Is my payment secure?", "We process payments through PCI-DSS Level 1 providers with TLS encryption. Card details are never stored on our servers."],
      ["What payment methods are accepted?", "All major credit/debit cards. Apple Pay and Google Pay where supported."],
      ["What is your refund policy?", "Unopened products may be returned within 30 days for a full refund. Opened products are eligible for store credit."],
    ],
  },
];

function FAQPage() {
  return (
    <>
      <section className="border-b border-border bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-teal">FAQ</div>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">Frequently asked questions</h1>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {SECTIONS.map((sec) => (
          <div key={sec.title} className="mb-12">
            <h2 className="font-display text-xl font-semibold">{sec.title}</h2>
            <Accordion type="single" collapsible className="mt-4 space-y-3">
              {sec.items.map(([q, a], i) => (
                <AccordionItem key={i} value={`${sec.title}-${i}`} className="overflow-hidden rounded-md border border-border bg-card px-5">
                  <AccordionTrigger className="font-display text-base font-medium hover:text-teal hover:no-underline">{q}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </section>
    </>
  );
}
