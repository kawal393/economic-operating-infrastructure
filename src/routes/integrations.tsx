import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { CopyBlock } from "@/components/copy-block";
import { cn } from "@/lib/utils";
import {
  INTEGRATIONS,
  INTEGRATION_CATEGORIES,
  type IntegrationStatus,
} from "@/content/integrations";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integration surface — what can be called and what is only written down" },
      {
        name: "description",
        content:
          "Nine public HTTP paths served by this deployment, callable with no account and no key, plus the machine-readable OpenAPI document. Twelve further entries are written notes with no package or listing published behind them.",
      },
      { property: "og:title", content: "Integration surface — Sovereign AI Services" },
      {
        property: "og:description",
        content:
          "Public read endpoints for the ledger, receipts and verification keys. No account, no key and no permission required to read the record.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/integrations" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/integrations" }],
  }),
  component: IntegrationsPage,
});

const STATUS_STYLES: Record<IntegrationStatus, string> = {
  "Live API": "border-success/30 bg-success/10 text-success",
  "Not published": "border-border bg-secondary/60 text-muted-foreground",
};

function IntegrationsPage() {
  const [category, setCategory] = useState<string>("All");

  const visible = useMemo(
    () =>
      category === "All" ? INTEGRATIONS : INTEGRATIONS.filter((item) => item.category === category),
    [category],
  );

  return (
    <>
      <PageHeader
        eyebrow="Integration surface"
        title="What can be called, and what is only written down"
        description="The public HTTP paths below are served by this deployment and can be read with no account, no key and no permission from us. The entries marked as written notes are documentation only: no package, no directory listing and no deployment exists behind them."
      >
        <Panel className="max-w-3xl">
          <h2 className="text-sm font-semibold tracking-tight">
            No integration count is published
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This platform runs no telemetry for third-party clients, so no figure for apps, agents
            or deployments is printed here. The only counters on this site are the ledger figures,
            fetched live from <span className="font-mono text-xs">/api/public/v1/ledger-stats</span>{" "}
            when the page loads.
          </p>
        </Panel>
      </PageHeader>

      <Section>
        <Panel className="border-warning/35 bg-warning/5">
          <h2 className="text-base font-semibold tracking-tight">
            Install commands removed on 3 September 2026
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            This page previously listed twelve integrations, ten of them badged as available now,
            each with a package name to install. Every one of those names was checked against the
            npm registry and PyPI: none is registered. Publishing an instruction to install an
            unregistered name is an open slot that anyone can fill with hostile code, and this
            platform will not direct readers into one. Where a note describes an integration that
            does not exist, it says so instead of offering a command.
          </p>
        </Panel>
      </Section>

      <Section>
        <div className="flex flex-wrap gap-2">
          {["All", ...INTEGRATION_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                category === cat
                  ? "border-gold/45 bg-gold/12 text-gold"
                  : "border-border bg-secondary/40 text-muted-foreground hover:border-gold/30 hover:text-foreground",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <Panel key={item.id} interactive className="flex flex-col scroll-mt-24">
              <div id={item.id} className="scroll-mt-24" />
              <div className="flex items-start justify-between gap-3">
                <span
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-gold/25 font-mono text-sm font-semibold text-gold"
                  style={{ background: "var(--gradient-surface)" }}
                  aria-hidden="true"
                >
                  {item.mark}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
                    STATUS_STYLES[item.status],
                  )}
                >
                  {item.status}
                </span>
              </div>

              <h3 className="mt-5 text-base font-semibold tracking-tight text-foreground">
                {item.name}
              </h3>
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {item.category}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>

              <div className="mt-5">
                <CopyBlock label="Access" value={item.access} />
              </div>

              <Link
                to={item.docs}
                className="group mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-gold"
              >
                Read the docs
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Panel>
          ))}
        </div>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Public paths"
          title="Build against the public paths"
          description="No SDK is published and no client library is distributed by this platform. The OpenAPI document describes every public path, and any language with an HTTP client can call it directly. Nothing here requires an account, an API key or permission from us."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/docs"
            className="glow-ring group inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
          >
            API documentation
          </Link>
          <a
            href="/openapi.json"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
          >
            Read the OpenAPI document
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Registry membership is free and confers no legal rights in any physical jurisdiction. This
          is a commercial software platform, not a state. Third parties named on this page are named
          descriptively; naming them is not a claim of endorsement, partnership or a working
          connector, and none of them has reviewed or approved anything published here.
        </p>
      </Section>
    </>
  );
}
