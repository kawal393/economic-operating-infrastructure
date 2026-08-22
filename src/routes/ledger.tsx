import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { PageHeader, Panel, Section, StatBlock } from "@/components/primitives";
import { getLedger, getLedgerStats, lookupDigest } from "@/lib/ledger.functions";

export const Route = createFileRoute("/ledger")({
  head: () => ({
    meta: [
      { title: "Public Ledger — Every Seal, Chained | Sovereign AI Services" },
      {
        name: "description",
        content:
          "The append-only Apex PSI notarisation chain. Every published seal is hash-linked to the one before it, readable by anyone, owned by no one.",
      },
      { property: "og:title", content: "The Public Ledger of the Workspace" },
      {
        property: "og:description",
        content:
          "An append-only, hash-linked chain of Apex PSI seals. Public to read, impossible to rewrite.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/ledger" }],
  }),
  component: LedgerPage,
});

function short(value: string | null, head = 10, tail = 6) {
  if (!value) return "—";
  return value.length <= head + tail ? value : `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function LedgerPage() {
  const ledgerFn = useServerFn(getLedger);
  const statsFn = useServerFn(getLedgerStats);
  const lookupFn = useServerFn(lookupDigest);

  const entries = useQuery({
    queryKey: ["ledger", 50],
    queryFn: () => ledgerFn({ data: { limit: 50 } }),
    refetchInterval: 20_000,
  });
  const stats = useQuery({
    queryKey: ["ledger-stats"],
    queryFn: () => statsFn(),
    refetchInterval: 20_000,
  });

  const [digest, setDigest] = useState("");
  const [found, setFound] = useState<null | Awaited<ReturnType<typeof lookupFn>>>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  async function runLookup() {
    setLookupError(null);
    setFound(null);
    const value = digest.trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(value)) {
      setLookupError("Paste a full 64-character SHA-256 digest.");
      return;
    }
    try {
      setFound(await lookupFn({ data: { digest: value } }));
    } catch {
      setLookupError("Lookup failed. Try again.");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Apex PSI · Chain of record"
        title="The Public Ledger"
        description="Every published seal is hash-linked to the one before it. Anyone may read it. No one — including this system architecture — can rewrite it. Publication is optional: sealing works entirely offline."
      />

      <Section>
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatBlock label="Chain entries" value={String(stats.data?.entries ?? "—")} />
          <StatBlock label="Members" value={String(stats.data?.members ?? "—")} />
          <StatBlock label="Nation-states" value={String(stats.data?.nationStates ?? "—")} />
          <StatBlock
            label="Protocol fees"
            value={stats.data ? `$${stats.data.feesUsd.toFixed(3)}` : "—"}
          />
        </dl>

        <Panel className="mt-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Current chain head
          </p>
          <p className="mt-3 break-all font-mono text-sm text-gold">
            {stats.data?.head ?? "Genesis — nothing has been published yet."}
          </p>
        </Panel>
      </Section>

      <Section>
        <Panel>
          <h2 className="text-lg font-semibold">Is this content on the chain?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste a SHA-256 digest. If it was ever published here, it will surface — with the
            moment it entered the record.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={digest}
              onChange={(e) => setDigest(e.target.value)}
              placeholder="64-character SHA-256 digest"
              className="flex-1 rounded-md border border-border bg-background/60 px-4 py-3 font-mono text-xs text-foreground outline-none transition-colors focus:border-gold/50"
            />
            <button
              type="button"
              onClick={runLookup}
              className="rounded-md bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Look up
            </button>
          </div>
          {lookupError ? <p className="mt-3 text-sm text-destructive">{lookupError}</p> : null}
          {found ? (
            found.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Not on the chain. Absence is not evidence of forgery — it only means nobody
                published this digest here.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {found.map((row) => (
                  <li key={row.receipt_id} className="rounded-md border border-border p-3 text-sm">
                    <span className="font-mono text-gold">{row.receipt_id}</span>
                    <span className="ml-3 text-muted-foreground">
                      sealed {new Date(row.created_at).toUTCString()}
                    </span>
                  </li>
                ))}
              </ul>
            )
          ) : null}
        </Panel>
      </Section>

      <Section>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-secondary/40">
              <tr className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Receipt</th>
                <th className="px-4 py-3">Content digest</th>
                <th className="px-4 py-3">Chain hash</th>
                <th className="px-4 py-3">Anchor</th>
                <th className="px-4 py-3">Sealed</th>
              </tr>
            </thead>
            <tbody>
              {entries.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Reading the chain…
                  </td>
                </tr>
              ) : (entries.data?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    The chain is empty.{" "}
                    <Link to="/seal" className="text-gold underline-offset-4 hover:underline">
                      Seal something
                    </Link>{" "}
                    and publish the first entry.
                  </td>
                </tr>
              ) : (
                entries.data?.map((row) => (
                  <tr key={row.receipt_id} className="border-t border-border/70">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {row.sequence}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gold">{row.receipt_id}</td>
                    <td className="px-4 py-3 font-mono text-xs">{short(row.content_hash)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{short(row.chain_hash)}</td>
                    <td className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                      {row.anchor_status}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(row.created_at).toISOString().replace("T", " ").slice(0, 19)}Z
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Integrity proven. Truth not verified. The chain proves ordering and non-alteration. It
          makes no claim about whether any sealed artefact is accurate, lawful or authored by
          anyone in particular.
        </p>
      </Section>
    </>
  );
}
