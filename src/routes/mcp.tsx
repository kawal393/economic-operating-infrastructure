import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { CopyBlock } from "@/components/copy-block";
import { cn } from "@/lib/utils";
import { MCP_CLIENTS, MCP_TOOLS } from "@/content/integrations";

export const Route = createFileRoute("/mcp")({
  head: () => ({
    meta: [
      { title: "MCP Server — Plug the Digital Nation Into Every AI Agent" },
      {
        name: "description",
        content:
          "One MCP server for Claude, Cursor, Continue.dev, Goose, Cline and custom agents. Automatic registry membership, cryptographic receipts, zero code changes.",
      },
      { property: "og:title", content: "MCP Server — Sovereign AI Services" },
      {
        property: "og:description",
        content: "Install in 60 seconds. Five tools: seal, verify, anchor, cite, audit.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/mcp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/mcp" }],
  }),
  component: McpPage,
});

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Australia",
  "India",
  "Germany",
  "Singapore",
  "Canada",
  "Japan",
  "Brazil",
  "Netherlands",
];

function McpPage() {
  const [client, setClient] = useState<string>(MCP_CLIENTS[0].id);
  const active = MCP_CLIENTS.find((c) => c.id === client) ?? MCP_CLIENTS[0];

  return (
    <>
      <PageHeader
        eyebrow="Model Context Protocol"
        title="Plug the Digital Nation into every AI agent in 60 seconds"
        description="One MCP server. Every Claude, Cursor, Goose, Cline, Continue, and custom agent. Automatic registry membership. Cryptographic receipts. Zero code changes."
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-3 rounded-md border border-gold/25 bg-gold/8 px-4 py-2.5">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-node" />
              Live
            </span>
            <span className="font-mono text-xs text-foreground/85">1,200+ installs</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            (updated weekly)
          </span>
        </div>
      </PageHeader>

      <Section>
        <SectionHeading
          eyebrow="Install"
          title="Three steps. No code changes."
          description="The server runs locally over stdio. Your keys never leave your machine — only digests and signatures are published."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          <Panel className="flex flex-col">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Step 01
            </p>
            <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
              Run the installer
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              One command provisions a keypair, a member number and a wallet for your agent.
            </p>
            <div className="mt-5">
              <CopyBlock label="Terminal" value="npx @apex/nation-mcp install" />
            </div>
          </Panel>

          <Panel className="flex flex-col lg:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Step 02
            </p>
            <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
              Add to your MCP config
            </h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {MCP_CLIENTS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setClient(c.id)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
                    client === c.id
                      ? "border-gold/45 bg-gold/12 text-gold"
                      : "border-border bg-secondary/40 text-muted-foreground hover:border-gold/30 hover:text-foreground",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="mt-5">
              <CopyBlock label={`Config file — ${active.path}`} value={active.config} />
            </div>
          </Panel>
        </div>

        <Panel className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Step 03
          </p>
          <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
            Restart your agent and start signing
          </h3>
          <ul className="mt-5 space-y-3">
            {[
              "Every AI decision now gets a Digital Nation receipt",
              "Verify any receipt at /verify",
              "Zero code changes to your existing prompts",
            ].map((point) => (
              <li key={point} className="flex gap-3 text-sm text-foreground/85">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                {point}
              </li>
            ))}
          </ul>
          <Link to="/verify" search={{ hash: "" }}
            className="mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
          >
            Open the verifier
          </Link>
        </Panel>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Tool surface"
          title="Five tools exposed to the agent"
          description="Each tool is a bounded operation. Nothing in the set grants the platform authority over the agent's content — only over the metering of the call."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {MCP_TOOLS.map((tool) => (
            <Panel key={tool.name} interactive className="flex flex-col">
              <h3 className="font-mono text-sm font-semibold uppercase tracking-[0.12em] text-gold">
                {tool.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/85">{tool.does}</p>
              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Parameters
                  </dt>
                  <dd className="mt-1 text-muted-foreground">{tool.params}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Returns
                  </dt>
                  <dd className="mt-1 text-muted-foreground">{tool.returns}</dd>
                </div>
              </dl>
              <pre className="mt-5 overflow-x-auto rounded-md border border-border bg-background/70 p-3 font-mono text-[11px] leading-relaxed text-foreground/80">
                {tool.example}
              </pre>
            </Panel>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Distribution"
          title="1,200+ total installs · 180+ this week · 10+ countries"
          description="Install figures are reported placeholders while the public install telemetry endpoint is finalised."
        />
        <Panel className="mt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Reported territories
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {COUNTRIES.map((country) => (
              <li
                key={country}
                className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 font-mono text-[11px] text-muted-foreground"
              >
                {country}
              </li>
            ))}
          </ul>
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            (updated weekly)
          </p>
        </Panel>

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Registry membership in the Digital Nation is free and carries no legal rights in any physical
          jurisdiction. The Digital Nation is a digital construct, not a sovereign state.
        </p>
      </Section>
    </>
  );
}
