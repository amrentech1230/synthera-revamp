import { createFileRoute, Link } from "@tanstack/react-router";
import { Beaker, Microscope, ShieldCheck, Sparkles } from "lucide-react";
import labImg from "@/assets/lab-interior.jpg";
import heroImg from "@/assets/hero-dna.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Synthera Therapeutics" },
      { name: "description", content: "Synthera Therapeutics is a premium peptide and supplement laboratory advancing science to optimize health." },
      { property: "og:image", content: labImg },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink py-32 text-background">
        <img src={heroImg} alt="" className="absolute inset-0 size-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 to-ink" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-glow">Our Story</div>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight sm:text-6xl">
            Premium science.<br />Personal performance.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-background/70">
            Synthera Therapeutics was founded by a team of biochemists, athletes, and clinicians who believed that the
            future of human performance lies at the intersection of pharmaceutical-grade rigor and personal wellness.
          </p>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="mx-auto grid max-w-7xl gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-teal">Mission</div>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Engineering the standard the industry hasn't.</h2>
            <p className="mt-6 leading-relaxed text-foreground/80">
              The peptide market is fragmented and uneven. Synthera was built to set a new bar — every batch
              third-party tested, every product accompanied by a certificate of analysis, and every research
              compound synthesized to ≥99% purity in cGMP-aligned facilities.
            </p>
            <p className="mt-4 leading-relaxed text-foreground/80">
              We believe quality is not a marketing claim. It's a measurement.
            </p>
          </div>
          <div className="overflow-hidden rounded-md border border-border">
            <img src={labImg} alt="Synthera laboratory" className="aspect-[4/3] w-full object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-teal">What we stand for</div>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Four pillars</h2>
          <div className="mt-12 grid gap-px bg-border md:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: Microscope, title: "Rigor", text: "HPLC, mass-spec, and identity testing on every lot." },
              { Icon: Beaker, title: "Purity", text: "≥99% purity standard — verified, not assumed." },
              { Icon: ShieldCheck, title: "Transparency", text: "COAs available for every product, every batch." },
              { Icon: Sparkles, title: "Innovation", text: "Continuous R&D into emerging compounds and formulations." },
            ].map(({ Icon, title, text }) => (
              <div key={title} className="bg-background p-8">
                <Icon className="size-7 text-teal" />
                <h3 className="mt-6 font-display text-lg font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Built with the researcher in mind.</h2>
          <p className="mt-6 leading-relaxed text-foreground/80">
            From individual researchers to clinical investigators, our customers demand rigor. We deliver compounds
            that pass third-party audit — and packaging, fulfillment, and support that make working with Synthera
            effortless.
          </p>
          <Link to="/request-access" className="mt-10 inline-block rounded-md bg-gradient-teal px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground">
            Request Portal Access
          </Link>
        </div>
      </section>
    </>
  );
}
