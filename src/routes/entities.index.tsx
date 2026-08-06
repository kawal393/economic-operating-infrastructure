import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader, Panel, Section } from "@/components/primitives";
import { listEntities, getEntityCounts } from "@/lib/entities.functions";

export const Route = createFileRoute("/entities/")({
  head: () => ({
    meta: [
      { title: "Registry of Companies, AIs and Assets | Sovereign AI Services" },
      {
        name: "description",
        content:
          "A public registry of companies, AI systems, institutions and people — showing which have sealed their assets to the open ledger and which have not.",
      },
      { property: "og:title", content: "The public registry of sealed and unsealed entities" },
      {
        property: "og:description",
        content:
          "Search every listed company, AI and individual. Sealed entries carry verifiable receipts; unsealed entries show the absence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/entities" }],
  }),
  component: EntitiesIndex,
});

function EntitiesIndex() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "sealed" | "unsealed">("all");

  const counts = useQuery({ queryKey: ["entity-counts"], queryFn: () => getEntityCounts() });
  const entities = useQuery({
    queryKey: ["entities", filter, query],
    queryFn: () => listEntities({ data: { limit: 100, sealed: filter, query: query || null } }),
  });

  return (
    <>
      <PageHeader
        eyebrow="Registry"
        title="Who is on the record — and who is not."
        description="Every company, AI system, institution and individual listed here is public. A sealed entry carries receipts anyone can verify offline. An unsealed entry carries none, and that absence is itself the signal."
      />

      <Section>
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={80}
            placeholder="Search the registry"
            className="input-field max-w-sm"
          />
          {(["all", "sealed", "unsealed"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                filter === f
                  ? "border-gold/50 bg-gold/10 text-gold"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
          <Link
            to="/onboard"
            className="ml-auto rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-gold"
          >
            Add an entity
          </Link>
        </div>

        {counts.data ? (
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {counts.data.sealed} sealed / {counts.data.total} listed
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {(entities.data ?? []).map((e) => (
            <Link key={e.id} to="/entities/$slug" params={{ slug: e.slug }} className="block">
              <Panel className="h-full transition-colors hover:border-gold/40">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {e.kind}
                    </p>
                    <h2 className="mt-1 text-lg text-foreground">{e.name}</h2>
                    {e.domain ? (
                      <p className="mt-1 font-mono text-xs text-muted-foreground">{e.domain}</p>
                    ) : null}
                  </div>
                  <span
                    className={`rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${
                      e.seal_status === "sealed"
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {e.seal_status}
                  </span>
                </div>
                {e.description ? (
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{e.description}</p>
                ) : null}
              </Panel>
            </Link>
          ))}
        </div>

        {entities.data && entities.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing matches yet. The registry grows one listing at a time.
          </p>
        ) : null}
      </Section>
    </>
  );
}
