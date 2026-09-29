import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, FlaskConical, Lightbulb, ShieldCheck, HeartPulse, Microscope, Dna,
  Activity, Sparkles, Users, Lock,
} from "lucide-react";
import heroImg from "@/assets/synthera-cinematic-dna-hero-branded.jpg";
import labImg from "@/assets/lab-interior.jpg";
import { FeatureCard, PartnerCta, Reveal, SectionHead } from "@/components/site/public-ui";
import { listResources } from "@/lib/public.functions";
import { THERAPEUTIC_AREAS } from "@/lib/site-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Synthera Therapeutics — Advancing Therapeutics Through Science & Innovation" },
      { name: "description", content: "Synthera Therapeutics develops innovative therapeutic solutions through science-driven research, responsible development and a commitment to quality." },
      { property: "og:title", content: "Synthera Therapeutics — Science & Innovation" },
      { property: "og:description", content: "Science-driven research and responsible development advancing therapeutic impact." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const STEPS = [
  ["01", "Identify", "Define unmet therapeutic needs and scientific opportunity."],
  ["02", "Research", "Rigorous investigation of mechanisms and molecular targets."],
  ["03", "Develop", "Translate discoveries into well-characterized candidates."],
  ["04", "Validate", "Verify quality, consistency and performance with evidence."],
  ["05", "Advance", "Progress validated science toward therapeutic impact."],
];

function Home() {
  const reduceMotion = useReducedMotion();
  const { data: resources = [] } = useQuery({ queryKey: ["resources"], queryFn: () => listResources() });

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-background">
        <motion.img
          src={heroImg} alt="" width={1920} height={1080} fetchPriority="high"
          initial={{ scale: 1.02 }}
          animate={reduceMotion ? undefined : { scale: [1.02, 1.065, 1.02], x: [0, -8, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 size-full object-cover object-[72%_center] sm:object-[68%_center] lg:object-center"
        />
        <motion.div aria-hidden
          className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_center,var(--teal-glow),transparent_68%)] opacity-10 mix-blend-screen"
          animate={reduceMotion ? undefined : { opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/10 sm:via-ink/75 lg:via-ink/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/25" />
        <div className="relative mx-auto grid min-h-[88vh] max-w-7xl items-center px-4 py-24 sm:px-6 lg:grid-cols-12 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-glow/30 bg-teal/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-teal-glow">
              <span className="size-1.5 animate-pulse rounded-full bg-teal-glow" /> Science · Innovation · Impact
            </span>
            <h1 className="mt-8 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Advancing <span className="text-gradient-teal">Therapeutics</span> Through Science &amp; <span className="text-gradient-chrome">Innovation</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-background/70 sm:text-lg">
              Synthera Therapeutics is focused on developing innovative therapeutic solutions through science-driven research, responsible development, and a commitment to advancing healthcare.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/science" className="glow-teal inline-flex items-center gap-2 rounded-md bg-gradient-teal px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:opacity-95">
                Explore Our Science <ArrowRight className="size-4" />
              </Link>
              <Link to="/signup" className="inline-flex items-center gap-2 rounded-md border border-background/30 bg-background/5 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-background backdrop-blur transition hover:border-teal-glow hover:text-teal-glow">
                Get Started <ArrowRight className="size-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead center eyebrow="Who we are" title="Science. Innovation. Therapeutic Impact."
            intro="Synthera brings together rigorous research, disciplined development and uncompromising quality to pursue therapeutic solutions that matter." />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={<FlaskConical className="size-6" />} title="Science Driven" body="Every decision is anchored in evidence and sound scientific method." />
            <FeatureCard delay={0.08} icon={<Lightbulb className="size-6" />} title="Innovation Focused" body="We pursue novel approaches to long-standing therapeutic challenges." />
            <FeatureCard delay={0.16} icon={<ShieldCheck className="size-6" />} title="Quality Led" body="Quality and documentation are designed into every step of our work." />
            <FeatureCard delay={0.24} icon={<HeartPulse className="size-6" />} title="Patient Focused" body="Better outcomes for patients remain the purpose behind our research." />
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl">
              <img src={labImg} alt="Synthera research laboratory" loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <SectionHead eyebrow="About Synthera" title="Built Around Science. Focused on Better Outcomes." />
            <div className="mt-8 space-y-6">
              {[
                ["Our Mission", "To advance healthcare through responsible, science-driven therapeutic research and development."],
                ["Our Vision", "A future where innovative science translates reliably into meaningful therapeutic impact."],
                ["Our Approach", "Disciplined research, transparent documentation and quality at every stage of development."],
              ].map(([t, b]) => (
                <div key={t} className="border-l-2 border-teal pl-5">
                  <h3 className="font-display text-lg font-semibold">{t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b}</p>
                </div>
              ))}
            </div>
            <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-teal hover:underline">
              Learn More About Synthera <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow="Therapeutic areas" title="Our Therapeutic Focus" intro="Broad areas of scientific focus. Specific product information is available to authorized portal users only." />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {THERAPEUTIC_AREAS.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.06}>
                <Link to="/therapeutic-areas" className="group block h-full rounded-xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:border-teal/50">
                  <a.icon className="size-8 text-teal" />
                  <h3 className="mt-5 font-display text-xl font-semibold">{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-teal">Learn More <ArrowRight className="size-3.5 transition group-hover:translate-x-1" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink py-24 text-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,var(--teal-glow),transparent_55%)] opacity-15" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-glow">Science & research</div>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Science Behind Our Innovation</h2>
          <p className="mt-4 max-w-2xl text-background/70">From early discovery to validation, our research pipeline is built on scientific collaboration and methodological rigor.</p>
          <div className="mt-14 grid gap-4 md:grid-cols-5">
            {[["Research", Microscope], ["Discovery", Dna], ["Development", FlaskConical], ["Validation", ShieldCheck], ["Therapeutic Innovation", Sparkles]].map(([t, Icon]: any, i) => (
              <Reveal key={t} delay={i * 0.08}>
                <div className="relative h-full rounded-xl border border-background/10 bg-background/5 p-6 backdrop-blur">
                  <Icon className="size-6 text-teal-glow" />
                  <div className="mt-4 text-xs text-background/50">Stage {i + 1}</div>
                  <div className="font-display text-lg">{t}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <Link to="/science" className="mt-10 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-teal-glow hover:underline">
            Explore Our Research <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead center eyebrow="Our approach" title="A Disciplined Path from Idea to Impact" />
          <div className="mt-14 grid gap-6 md:grid-cols-5">
            {STEPS.map(([n, t, b], i) => (
              <Reveal key={n} delay={i * 0.07}>
                <div className="h-full border-t-2 border-teal pt-5">
                  <div className="font-display text-3xl text-teal/60">{n}</div>
                  <h3 className="mt-2 font-display text-lg font-semibold">{t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-24">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHead eyebrow="Why Synthera" title="A Partner Built on Rigor" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {[[FlaskConical, "Science Driven"], [ShieldCheck, "Quality Focused"], [Lightbulb, "Innovation"], [Users, "Collaboration"]].map(([Icon, t]: any) => (
                <div key={t} className="flex items-start gap-3">
                  <Icon className="mt-0.5 size-5 text-teal" />
                  <div><div className="font-semibold">{t}</div><p className="text-sm text-muted-foreground">Consistent standards applied across research and development.</p></div>
                </div>
              ))}
            </div>
          </div>
          <Reveal>
            <div className="h-full rounded-2xl border border-border bg-card p-8">
              <Activity className="size-8 text-teal" />
              <h3 className="mt-4 font-display text-2xl font-semibold">Quality Is Built Into Every Step</h3>
              <ul className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                {["Quality assurance", "Development standards", "Manufacturing standards", "Regulatory considerations", "Documentation", "Process integrity"].map((q) => (
                  <li key={q} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-teal" />{q}</li>
                ))}
              </ul>
              <Link to="/quality" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-teal hover:underline">Our Quality Commitment <ArrowRight className="size-4" /></Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead eyebrow="Insights" title="Insights & Resources" />
            <Link to="/resources" className="text-sm font-semibold uppercase tracking-wider text-teal hover:underline">All resources</Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {resources.slice(0, 3).map((r) => (
              <Link key={r.id} to="/resources/$slug" params={{ slug: r.slug }} className="group rounded-xl border border-border bg-card p-7 transition hover:border-teal/50">
                <div className="text-xs font-semibold uppercase tracking-wider text-teal">{r.category}</div>
                <h3 className="mt-3 font-display text-xl font-semibold group-hover:text-teal">{r.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{r.excerpt}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">Read More <ArrowRight className="size-3.5" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40 py-14">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Lock className="size-8 text-teal" />
            <div>
              <div className="font-display text-xl font-semibold">Authorized product information</div>
              <p className="text-sm text-muted-foreground">Product details and documentation are available through the secure Synthera portal.</p>
            </div>
          </div>
          <Link to="/login" className="rounded-md border border-teal px-6 py-3 text-sm font-semibold uppercase tracking-wider text-teal transition hover:bg-teal hover:text-primary-foreground">Access Product Portal</Link>
        </div>
      </section>

      <PartnerCta />
    </>
  );
}

