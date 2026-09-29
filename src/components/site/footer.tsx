import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/contact.functions";
import { toast } from "sonner";
import logo from "@/assets/synthera-logo.png";

export function Footer() {
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      await subscribe({ data: { email } });
      toast.success("Subscribed. Welcome to the lab.");
      setEmail("");
    } catch (err: any) {
      toast.error(err?.message ?? "Subscription failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="border-t border-border/60 bg-ink text-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Synthera" className="h-12 w-auto invert" />
              <div>
                <div className="font-display text-lg tracking-wider">SYNTHERA</div>
                <div className="-mt-1 text-[10px] uppercase tracking-[0.3em] text-background/60">
                  Therapeutics
                </div>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-background/70">
              Advancing science. Optimizing health. Science-driven therapeutic research and development,
              built on quality, integrity and innovation.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid size-9 place-items-center rounded-full border border-background/20 text-background/70 transition hover:border-teal hover:text-teal"
                  aria-label="Social link"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            <FooterCol
              title="Explore"
              links={[
                ["Science", "/science"],
                ["Therapeutic Areas", "/therapeutic-areas"],
                ["Quality", "/quality"],
                ["Get Started", "/signup"],
                ["Request Access", "/request-access"],
                ["Portal Login", "/login"],
              ]}
            />
            <FooterCol
              title="Company"
              links={[
                ["About", "/about"],
                ["Resources", "/resources"],
                ["Contact", "/contact"],
                ["FAQ", "/faq"],
              ]}
            />
            <FooterCol
              title="Policies"
              links={[
                ["Shipping", "/shipping-policy"],
                ["Returns", "/refund-policy"],
                ["Privacy", "/privacy"],
                ["Terms", "/terms"],
                ["Disclaimer", "/disclaimer"],
              ]}
            />
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-background/80">
              Newsletter
            </h4>
            <p className="mt-3 text-sm text-background/60">
              Research updates and company news.
            </p>
            <form onSubmit={onSubmit} className="mt-4 flex">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@lab.com"
                className="flex-1 rounded-l-md border border-background/20 bg-background/5 px-3 py-2 text-sm placeholder:text-background/40 focus:border-teal focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-r-md bg-gradient-teal px-4 text-sm font-medium text-primary-foreground transition disabled:opacity-50"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-14 border-t border-background/10 pt-6">
          <p className="text-xs leading-relaxed text-background/50">
            <strong className="text-background/70">FDA Disclaimer:</strong> Statements regarding dietary
            supplements have not been evaluated by the FDA and are not intended to diagnose, treat, cure,
            or prevent any disease. Research compounds are sold for laboratory and research purposes only,
            not for human consumption.
          </p>
          <p className="mt-3 text-xs text-background/40">
            © {new Date().getFullYear()} Synthera Therapeutics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-background/80">{title}</h4>
      <ul className="mt-4 space-y-2">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link to={to} className="text-sm text-background/60 transition hover:text-teal">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
