import { Link } from "@tanstack/react-router";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/synthera-logo.png";
import { useAuth } from "@/hooks/use-auth";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/science", label: "Science" },
  { to: "/therapeutic-areas", label: "Therapeutic Areas" },
  { to: "/quality", label: "Quality" },
  { to: "/resources", label: "Resources" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl transition-all">
      <div className="marquee overflow-hidden border-b border-teal-glow/15 bg-ink text-teal-glow" aria-label="Free shipping above $200">
        <div className="marquee-track py-2 text-[11px] font-semibold uppercase tracking-[0.3em]">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="flex items-center whitespace-nowrap">
              <span className="px-6">Free shipping above $200</span>
              <span className="size-1 shrink-0 rounded-full bg-teal-glow/60" />
            </span>
          ))}
        </div>
      </div>
      <div className={`mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 transition-all sm:px-6 lg:px-8 ${scrolled ? "h-16" : "h-20"}`}>
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Synthera Therapeutics" className={`w-auto transition-all ${scrolled ? "h-9" : "h-12"}`} />
          <div className="hidden sm:block">
            <div className="font-display text-base font-semibold tracking-wider text-foreground">SYNTHERA</div>
            <div className="-mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Therapeutics</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 xl:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="text-sm font-medium text-foreground/75 transition-colors hover:text-teal"
              activeProps={{ className: "text-teal" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/customer/dashboard" className="hidden items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:border-teal hover:text-teal sm:inline-flex">
              <LayoutDashboard className="size-4" /> Portal
            </Link>
          ) : (
            <Link to="/login" className="hidden px-3 py-2 text-sm font-medium text-foreground/80 transition hover:text-teal sm:inline-flex">
              Login
            </Link>
          )}
          <Link to="/signup" className="hidden rounded-md bg-gradient-teal px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 sm:inline-flex">
            Get Started
          </Link>
          <button className="rounded-full p-2 text-foreground/70 hover:bg-muted xl:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background xl:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-3 text-sm font-medium text-foreground/80">
                {n.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-4">
              <Link to={user ? "/customer/dashboard" : "/login"} onClick={() => setOpen(false)} className="rounded-md border border-border py-2.5 text-center text-sm font-medium">
                {user ? "Portal" : "Login"}
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="rounded-md bg-gradient-teal py-2.5 text-center text-sm font-semibold text-primary-foreground">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
