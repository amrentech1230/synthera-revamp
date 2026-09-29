import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-background sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--teal-glow),transparent_60%)] opacity-20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--background)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--background)_6%,transparent)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-glow">{eyebrow}</div>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">{title}</h1>
          {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-background/70">{intro}</p>}
        </motion.div>
      </div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, intro, center }: { eyebrow: string; title: string; intro?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-teal">{eyebrow}</div>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {intro && <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{intro}</p>}
    </div>
  );
}

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

export function FeatureCard({ icon, title, body, delay }: { icon: ReactNode; title: string; body: string; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <div className="group h-full rounded-xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:border-teal/50 hover:shadow-[0_20px_40px_-20px_var(--teal)]">
        <div className="grid size-12 place-items-center rounded-lg bg-teal/10 text-teal transition group-hover:bg-teal group-hover:text-primary-foreground">
          {icon}
        </div>
        <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </Reveal>
  );
}

export function PartnerCta() {
  return (
    <section className="relative overflow-hidden bg-gradient-teal py-20 text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Let's Advance Therapeutics Together</h2>
          <p className="mt-3 text-primary-foreground/80">
            We welcome conversations with research partners, collaborators and organizations who share our commitment to science-driven progress.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-md bg-background px-6 py-3 text-sm font-semibold uppercase tracking-wider text-foreground transition hover:bg-background/90">
            Partner With Us <ArrowRight className="size-4" />
          </Link>
          <Link to="/contact" className="inline-flex items-center rounded-md border border-primary-foreground/40 px-6 py-3 text-sm font-semibold uppercase tracking-wider transition hover:bg-primary-foreground/10">
            Contact Synthera
          </Link>
        </div>
      </div>
    </section>
  );
}

export const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20";

export function FormField({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        {required && <span className="text-teal"> *</span>}
      </span>
      {children}
    </label>
  );
}
