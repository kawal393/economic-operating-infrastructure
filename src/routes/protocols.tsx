import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, Section, SectionHeading, StatusDot } from "@/components/primitives";
import { INDUSTRY_PROTOCOLS, UNIFICATION_PROTOCOLS, type Protocol } from "@/content/nation";

export const Route = createFileRoute("/protocols")({
  head: () => ({
    meta: [
      { title: "Protocol Explorer — 5 Unification + 21 Industry Protocols | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Browse the five charter-level unification protocols and the twenty-one industry protocols that form the statutory law of the workspace.",
      },
      { property: "og:title", content: "Protocol Explorer" },
      {
        property: "og:description",
        content: "Five unification protocols. Twenty-one industry protocols. All versioned.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/protocols" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/protocols" }],
  }),
  component: ProtocolsPage,
});

function ProtocolsPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Protocol | null>(null);

  const filter = (list: Protocol[]) =>
    list.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()),
    );

  const unification = useMemo(() => filter(UNIFICATION_PROTOCOLS), [query]);
  const industry = useMemo(() => filter(INDUSTRY_PROTOCOLS), [query]);

  return (
    <>
      <PageHeader
        eyebrow="Protocol Explorer"
        title="Five charter-level protocols. Twenty-one statutory protocols."
        description="The unification protocols are charter-level and may not be contradicted. The industry protocols are statutory: domain-specific, versioned, and subordinate to every Article."
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search protocols"
              maxLength={80}
              className="w-72 rounded-md border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold/50"
            />
          </div>
          <button
            type="button"
            onClick={() =>
              toast("Protocol Engine queued", {
                description: "Draft submitted to the Protocol evolution engine for versioning.",
              })
            }
            className="rounded-md border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
          >
            Generate New Protocol
          </button>
        </div>
      </PageHeader>

      <Section>
        <SectionHeading
          eyebrow="Charter-level"
          title="Unification protocols"
          description="Five articles. Amendable only under the thresholds set by the Charter."
        />
        <Grid protocols={unification} onSelect={setSelected} />
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Statutory"
          title="Industry protocols"
          description="Twenty-one domain protocols carrying sector-specific compliance rules and conformity receipts."
        />
        <Grid protocols={industry} onSelect={setSelected} />
      </Section>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-5 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="surface-panel glow-ring w-full max-w-lg rounded-lg p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">
                  {selected.kind === "unification" ? "Charter-level" : "Statutory"}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">{selected.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Close
              </button>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {selected.description}
            </p>
            <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-5">
              {[
                ["Version", selected.version],
                ["Status", selected.status],
                ["Usage", selected.usageCount.toLocaleString()],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="mt-1.5 font-mono text-sm text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Grid({
  protocols,
  onSelect,
}: {
  protocols: Protocol[];
  onSelect: (p: Protocol) => void;
}) {
  if (protocols.length === 0) {
    return (
      <p className="mt-10 font-mono text-sm text-muted-foreground">
        No protocols match that query.
      </p>
    );
  }

  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {protocols.map((p) => (
        <button key={p.id} type="button" onClick={() => onSelect(p)} className="text-left">
          <Panel interactive className="h-full">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                v{p.version}
              </span>
              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <StatusDot active={p.status === "Active"} />
                {p.status}
              </span>
            </div>
            <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
              {p.name}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
            <p className="mt-5 font-mono text-xs text-gold">
              {p.usageCount.toLocaleString()} invocations
            </p>
          </Panel>
        </button>
      ))}
    </div>
  );
}
