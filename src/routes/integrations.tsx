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
      { title: "Integrations Marketplace — Plug Your App Into the Verification Layer" },
      {
        name: "description",
        content:
          "Twelve ways to plug any app, AI agent or workflow into the workspace: MCP, LangChain, Composio, Nango, Hugging Face, Make, Pipedream, Zapier, Vercel and OpenAI.",
      },
      { property: "og:title", content: "The Integrations Marketplace — Sovereign AI Services" },
      {
        property: "og:description",
        content:
          "Become a member. Deploy a nation. Vote on the Charter. Zero permission.",
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
  "Available Now": "border-success/30 bg-success/10 text-success",
  "In Development": "border-warning/30 bg-warning/10 text-warning",
  "Coming Soon": "border-border bg-secondary/60 text-muted-foreground",
};

function IntegrationsPage() {
  const [category, setCategory] = useState<string>("All");

  const visible = useMemo(
    () =>
      category === "All"
        ? INTEGRATIONS
        : INTEGRATIONS.filter((item) => item.category === category),
    [category],
  );

  return (
    <>
      <PageHeader
        eyebrow="The Integrations Marketplace"
        title="Plug Your App Into the Verification Layer"
        description="Become a member. Deploy a nation. Vote on the Charter. Zero permission."
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex flex-wrap items-center gap-3 rounded-md border border-gold/25 bg-gold/8 px-4 py-2.5">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-node" />
              Live
            </span>
            <span className="font-mono text-xs text-foreground/85">
              12+ apps integrated · 400+ agents as members · 60+ nations deployed via integrations
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            (updated weekly)
          </span>
        </div>
      </PageHeader>

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
                <CopyBlock label="Install" value={item.install} />
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
          eyebrow="Open protocol"
          title="Build Your Own Integration"
          description="Don't see your tool? The protocol is open to anyone. Build your own integration — the protocol is open, the Charter is public, and the SDK is MIT licensed."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="https://github.com/apex-psi/nation-sdk"
            target="_blank"
            rel="noreferrer noopener"
            className="glow-ring group inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
          >
            Open the GitHub repo
            <ExternalLink className="h-4 w-4" />
          </a>
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
          >
            API documentation
          </Link>
        </div>

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Registry membership is free and confers no legal rights in any physical jurisdiction. This is a commercial software platform, not a state.
        </p>
      </Section>
    </>
  );
}
