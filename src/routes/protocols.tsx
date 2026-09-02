import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, Panel, Section, SectionHeading, StatusDot } from "@/components/primitives";
import { USAGE_STATUS } from "@/content/legal";
import { INDUSTRY_PROTOCOLS, UNIFICATION_PROTOCOLS, type Protocol } from "@/content/nation";

export const Route = createFileRoute("/protocols")({
  head: () => ({
    meta: [
      {
        title:
          "Protocol Explorer — five charter Articles, twenty-one named domains | Sovereign AI Services",
      },
      {
        name: "description",
        content:
          "The five charter Articles are in force as published, digest-checked text. The twenty-one industry domains are named by the charter; no specification is published for any of them. No invocation counters are printed, because no meter exists to count them.",
      },
      { property: "og:title", content: "Protocol Explorer" },
      {
        property: "og:description",
        content:
          "Five Articles in force as published text. Twenty-one domains named, none yet specified.",
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
        title="Five charter Articles in force. Twenty-one domains named, none yet specified."
        description="The five Articles are charter-level: published, digest-checked on every load, and amendable only under the thresholds the Charter sets. The twenty-one industry domains are the fields the charter names. Naming a domain is not publishing a specification, and this page does not claim otherwise."
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
          <Link
            to="/amendments"
            className="rounded-md border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
          >
            Propose an amendment
          </Link>
        </div>
      </PageHeader>

      <Section>
        <Panel className="mb-12 border-gold/40 bg-gold/5 p-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
            No counters on this page — read this first
          </p>
          <p className="mt-3.5 text-sm leading-relaxed text-foreground">
            {USAGE_STATUS} An earlier version of this page printed an invocation count for every
            protocol, in gold, as though it had been metered: 418,293 for Article I, 209,771 for
            PSI-Media, 71,203 for PSI-Commerce. Nothing was metered and no table anywhere counts
            these events. The numbers are removed rather than relabelled, because a figure with no
            source cannot be made honest by writing “modelled” beside it. The same reason removed
            the version numbers from the twenty-one domains: an unpublished specification has no
            version. Changing protocol law has one real path, and it is{" "}
            <Link to="/amendments" className="text-gold underline underline-offset-2">
              /amendments
            </Link>{" "}
            — signed, digested, fourteen days of deliberation, public record.
          </p>
        </Panel>
        <SectionHeading
          eyebrow="Charter-level"
          title="The five Articles"
          description="In force as published charter text, version 1. Amendable only under the thresholds the Charter sets."
        />
        <Grid protocols={unification} onSelect={setSelected} />
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Named domains"
          title="Industry protocols"
          description="Twenty-one domains the charter names as the fields it covers. No specification is published for any of them yet, so no conformity receipt can be issued against one."
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
                  {selected.kind === "unification" ? "Charter-level" : "Named domain"}
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
            <p className="mt-4 border-t border-border pt-5 text-sm leading-relaxed text-muted-foreground">
              {selected.specification}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-4">
              {[
                ["Version", selected.version],
                ["Status", selected.status],
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

function Grid({ protocols, onSelect }: { protocols: Protocol[]; onSelect: (p: Protocol) => void }) {
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
                {p.version === "—" ? "unversioned" : `v${p.version}`}
              </span>
              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <StatusDot active={p.status === "In force"} />
                {p.status}
              </span>
            </div>
            <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
              {p.name}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
            <p className="mt-5 font-mono text-xs text-muted-foreground">{p.specification}</p>
          </Panel>
        </button>
      ))}
    </div>
  );
}
