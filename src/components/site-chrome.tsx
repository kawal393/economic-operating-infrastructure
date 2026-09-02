import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FOOTER_CREED } from "@/content/nation";
import { INDEPENDENCE_LINE, PRECISION_CLAIM } from "@/content/legal";
import { LegalDisclaimer } from "@/components/legal";
import sovereignMark from "@/assets/sovereign-mark.png";

/** Five primary destinations stay inline; everything else lives in two menus. */
const NAV_PRIMARY = [
  { to: "/seal", label: "Seal" },
  { to: "/verify", label: "Verify" },
  { to: "/ledger", label: "Ledger" },
  { to: "/registry", label: "Registry" },
  { to: "/docs", label: "Docs" },
] as const;

const NAV_MENUS = [
  {
    title: "Platform",
    links: [
      { to: "/charter", label: "Protocol Charter" },
      { to: "/architecture", label: "Architecture" },
      { to: "/protocols", label: "Protocols" },
      { to: "/transparency", label: "Transparency Log" },
      { to: "/steward", label: "Platform Steward" },
      { to: "/security", label: "Sentinel" },
    ],
  },
  {
    title: "Build",
    links: [
      { to: "/integrations", label: "Integrations" },
      { to: "/credentials", label: "Agent credentials" },
      {
        to: "/contracts",
        label: "On-chain mirror",
        note: "SPECIFIED — not deployed",
      },
      { to: "/registry-join", label: "Registry membership" },
      { to: "/pricing", label: "Pricing" },
      { to: "/dashboard", label: "Dashboard" },
    ],
  },
] as const;

const NAV_ALL = [
  ...NAV_PRIMARY.map((l) => ({ ...l })),
  ...NAV_MENUS.flatMap((m) => m.links.map((l) => ({ ...l }))),
];

const FOOTER_GROUPS = [
  {
    title: "The Platform",
    links: [
      { to: "/charter", label: "Protocol Charter" },
      { to: "/architecture", label: "System architecture" },
      { to: "/steward", label: "Platform steward" },
      { to: "/security", label: "Cryptographic defence layer" },
      { to: "/registry-join", label: "Registry membership (free)" },
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
      { to: "/deploy", label: "Seal & register a workspace" },
      { to: "/contracts", label: "On-chain mirror (not deployed)" },
      { to: "/transactions", label: "Fee schedule" },
    ],
  },

  {
    title: "Builders",
    links: [
      { to: "/docs", label: "API Documentation" },
      { to: "/integrations", label: "Integrations" },
      { to: "/mcp", label: "MCP Server" },
      { to: "/interop", label: "Standards Bridge" },
      { to: "/credentials", label: "Agent credentials" },
      { to: "/pricing", label: "Pricing" },

      { to: "/dashboard", label: "Dashboard" },
    ],
  },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 lg:grid-cols-[minmax(0,auto)_1fr_minmax(0,auto)] lg:gap-6 lg:px-8">
        <Link
          to="/"
          className="group flex min-w-0 items-center gap-3"
          onClick={() => {
            setOpen(false);
            setMenu(null);
          }}
        >
          <SovereignMark />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-sm font-semibold tracking-tight text-foreground">
              Sovereign AI Services
            </span>
            <span className="mt-1 hidden truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
              Verification &amp; record-keeping layer
            </span>
          </span>
        </Link>

        <div ref={navRef} className="hidden justify-center lg:flex">
          <nav className="flex items-center gap-0.5">
            {NAV_PRIMARY.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenu(null)}
                className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "text-gold bg-secondary" }}
              >
                {item.label}
              </Link>
            ))}

            {NAV_MENUS.map((group) => (
              <div key={group.title} className="relative">
                <button
                  type="button"
                  aria-expanded={menu === group.title}
                  aria-haspopup="true"
                  onClick={() => setMenu((m) => (m === group.title ? null : group.title))}
                  className={cn(
                    "inline-flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary hover:text-foreground",
                    menu === group.title ? "bg-secondary text-foreground" : "text-muted-foreground",
                  )}
                >
                  {group.title}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      menu === group.title && "rotate-180",
                    )}
                  />
                </button>

                {menu === group.title ? (
                  <div className="absolute left-1/2 top-full z-50 mt-2 w-60 -translate-x-1/2 rounded-lg border border-border bg-background/95 p-1.5 shadow-xl backdrop-blur-xl">
                    {group.links.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMenu(null)}
                        className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        activeProps={{ className: "text-gold bg-secondary" }}
                      >
                        {link.label}
                        {"note" in link && link.note ? (
                          <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.14em] text-warning">
                            {link.note}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>
        </div>

        <div className="hidden shrink-0 items-center justify-end gap-3 lg:flex">
          <Link
            to="/registry-join"
            className="whitespace-nowrap rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
          >
            Join the registry
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center justify-self-end rounded-md border border-border text-foreground lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-background lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1 px-5 py-4 sm:grid-cols-2">
            {NAV_ALL.map((item) => (
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
              to="/registry-join"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md border border-gold/40 bg-gold/10 px-3 py-2.5 text-center text-sm font-medium text-gold sm:col-span-2"
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
              Verification and record-keeping infrastructure for AI agents and their operators.
              Registry membership is free. What the platform does — verification, anchoring,
              post-quantum signing and a public ledger — is free at the point of use, because no
              payment processor is connected and nothing here takes money.
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
