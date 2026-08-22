import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FOOTER_CREED } from "@/content/nation";
import { INDEPENDENCE_LINE, PRECISION_CLAIM } from "@/content/legal";
import { LegalDisclaimer } from "@/components/legal";
import sovereignMark from "@/assets/sovereign-mark.png";


const NAV = [
  { to: "/minister", label: "Steward" },
  { to: "/seal", label: "Seal" },
  { to: "/verify", label: "Verify" },
  { to: "/ledger", label: "Ledger" },
  { to: "/registry", label: "Registry" },
  { to: "/transparency", label: "Transparency" },
  { to: "/constitution", label: "Charter" },
  { to: "/government", label: "Architecture" },
  { to: "/protocols", label: "Protocols" },
  { to: "/citizenship", label: "Registry membership" },
  { to: "/capital", label: "Capital" },
  { to: "/integrations", label: "Integrations" },
  { to: "/passport", label: "Agent credentials" },
  { to: "/security", label: "Sentinel" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/docs", label: "Docs" },
] as const;


const FOOTER_GROUPS = [
  {
    title: "The Platform",
    links: [
      { to: "/constitution", label: "Protocol Charter" },
      { to: "/government", label: "System architecture" },
      { to: "/minister", label: "Platform steward" },
      { to: "/security", label: "Cryptographic defence layer" },
      { to: "/citizenship", label: "Registry membership (free)" },
      { to: "/amendments", label: "Amendments" },
      { to: "/governance", label: "Governance" },
      { to: "/amplify", label: "Amplify" },
    ],
  },
  {
    title: "Infrastructure",
    links: [
      { to: "/seal", label: "Seal" },
      { to: "/verify", label: "Verify" },
      { to: "/ledger", label: "Public record layer" },
      { to: "/transparency", label: "Transparency Log" },
      { to: "/protocols", label: "Protocol Explorer" },
      { to: "/deploy", label: "Workspace deployer" },
      { to: "/contracts", label: "Smart Contracts" },
      { to: "/transactions", label: "Transactions" },
    ],
  },

  {
    title: "Builders",
    links: [
      { to: "/docs", label: "API Documentation" },
      { to: "/integrations", label: "Integrations" },
      { to: "/mcp", label: "MCP Server" },
      { to: "/interop", label: "Standards Bridge" },
      { to: "/passport", label: "Agent credentials" },
      { to: "/capital", label: "Sovereign Capital" },
      { to: "/pricing", label: "Pricing" },

      { to: "/dashboard", label: "Dashboard" },
    ],
  },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
        <Link to="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <SovereignMark />
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Sovereign AI Services
            </span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Verification & settlement layer
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-gold bg-secondary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/citizenship"
            className="rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
          >
            Join the registry
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1 px-5 py-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "text-gold bg-secondary" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/citizenship"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md border border-gold/40 bg-gold/10 px-3 py-2.5 text-center text-sm font-medium text-gold"
            >
              Join the registry
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function SovereignMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gold/35 bg-gold/10",
        className,
      )}
      aria-hidden="true"
    >
      <img
        src={sovereignMark}
        alt=""
        width={1024}
        height={1024}
        className="h-6 w-6 object-contain"
      />
    </span>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <SovereignMark />
              <span className="text-sm font-semibold tracking-tight">Sovereign AI Services</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              The verification &amp; settlement layer for the AI economy. Registry membership is
              free. The infrastructure — verification, anchoring, post-quantum defence, protocol
              evolution and surplus routing — is the product.
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Powered by <span className="text-gold">Apex PSI</span> — {PRECISION_CLAIM}.{" "}
              {INDEPENDENCE_LINE}
            </p>

            <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-gold">
              sovereign-ai.services
            </p>
          </div>


          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <LegalDisclaimer className="mt-12" />

        <div className="mt-8 hairline" />

        <div className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-sovereign text-base font-semibold tracking-tight">{FOOTER_CREED}</p>
          <p className="font-mono text-xs text-muted-foreground">
            Ed25519 · ML-DSA-65 · LMS · SHA-256 · OpenTimestamps
          </p>
        </div>

      </div>
    </footer>
  );
}
