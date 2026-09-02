import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { CopyBlock } from "@/components/copy-block";
import { cn } from "@/lib/utils";
import { MCP_CLIENTS, MCP_TOOLS } from "@/content/integrations";

export const Route = createFileRoute("/mcp")({
  head: () => ({
    meta: [
      { title: "MCP Server — Plug the Verification Layer Into an AI Agent" },
      {
        name: "description",
        content:
          "An MCP server for Claude, Cursor, Continue.dev, Goose, Cline and custom agents: five tools — seal, verify, anchor, cite, audit. Written and runnable from source, not yet published to a package registry, so no install command resolves and no install count exists.",
      },
      { property: "og:title", content: "MCP Server — Sovereign AI Services" },
      {
        property: "og:description",
        content:
          "Five tools: seal, verify, anchor, cite, audit. Runnable from source; not published to a registry.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/mcp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/mcp" }],
  }),
  component: McpPage,
});

// NO TERRITORY LIST IS DEFINED HERE.
//
// This file used to print ten countries as “reported territories” under a headline
// of “1,200+ total installs · 180+ this week · 10+ countries”. There is no install
// telemetry, no registry listing and no distribution record behind any of it: the
// package name this page advertises returns 404 on npm. The list is deleted rather
// than relabelled, because a figure with no source cannot be made honest by writing
// “placeholder” beside it while still printing it as a headline.

function McpPage() {
  const [client, setClient] = useState<string>(MCP_CLIENTS[0].id);
  const active = MCP_CLIENTS.find((c) => c.id === client) ?? MCP_CLIENTS[0];

  return (
    <>
      <PageHeader
        eyebrow="Model Context Protocol"
        title="Plug the verification layer into an AI agent — five MCP tools"
        description="One MCP server for Claude, Cursor, Goose, Cline, Continue and custom agents: seal, verify, anchor, cite, audit. The server is written and runs from source. It is not published to a package registry yet, so there is no install count and no install command that resolves."
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-3 rounded-md border border-warning/40 bg-warning/10 px-4 py-2.5">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-warning">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              Not published
            </span>
            <span className="font-mono text-xs text-foreground/85">no install count exists</span>
          </div>
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
              One command would provision a keypair, a member number and a wallet for your agent.
            </p>
            <div className="mt-5">
              <CopyBlock
                label="Terminal — does not resolve yet"
                value="npx @apex/nation-mcp install"
              />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-warning">
              That package name is not registered on npm and returns 404, so this command fails
              today. It is printed as the intended entry point, not as something that works. Until
              the name is published by this platform, a stranger could publish a package under it —
              install nothing by this name from a registry.
            </p>
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
              "Every AI decision now gets a platform receipt",
              "Verify any receipt at /verify",
              "Zero code changes to your existing prompts",
            ].map((point) => (
              <li key={point} className="flex gap-3 text-sm text-foreground/85">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                {point}
              </li>
            ))}
          </ul>
          <Link
            to="/verify"
            search={{ hash: "" }}
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
          description="Each tool is a bounded operation over the public API: seal a digest, verify a receipt, request an anchor, format a citation, audit a chain. Nothing in the set grants the platform authority over the agent's content, and nothing in it meters or charges the call — no payment processor is connected anywhere on this platform."
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
          title="No installs have been counted, because nothing has been published"
          description="There is no registry listing, no install telemetry and no distribution record. When the server is published, the count will be read from the registry rather than written into this page."
        />
        <Panel className="mt-10 border-warning/40 bg-warning/5 p-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-warning">
            What was here before
          </p>
          <p className="mt-3.5 text-sm leading-relaxed text-foreground">
            A headline reading “1,200+ total installs · 180+ this week · 10+ countries”, a gold
            “Live” badge carrying “1,200+ installs (updated weekly)”, and ten countries listed as
            reported territories. None of it came from anything. The server exists as compiled
            source; the package name it advertised returns 404 on npm, so no one could have
            installed it by that name, and no endpoint anywhere counts installs. Publishing a number
            nobody measures is the exact failure this platform exists to make impossible, so it is
            removed.
          </p>
        </Panel>

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Registry membership is free and confers no legal rights in any physical jurisdiction. This
          is a commercial software platform, not a state.
        </p>
      </Section>
    </>
  );
}
