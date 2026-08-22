import { createFileRoute } from "@tanstack/react-router";
import { readLedger, readStats } from "@/lib/ledger.server";
import { CORS_PREFLIGHT, signedJson } from "@/lib/nation-key.server";
import { FOUNDING_SEALS } from "@/content/legal";

const APEX_BASE = "https://qhtntebpcribjiwrdtdd.supabase.co/functions/v1";

type Anchor = {
  id: string;
  anchor_hash: string;
  bitcoin_txid: string | null;
  block_height: number | null;
  entries_count: number | null;
  status: string | null;
  confirmed_at: string | null;
  created_at: string | null;
};

/**
 * Genesis statistics. Every figure here is re-derivable from a public source:
 * the platform ledger table, the APEX PSI anchor history, or the founding seals.
 * Nothing is estimated, extrapolated or seeded.
 */
export const Route = createFileRoute("/api/public/v1/ledger-stats")({
  server: {
    handlers: {
      OPTIONS: () => CORS_PREFLIGHT.clone(),
      GET: async () => {
        const [statsResult, entriesResult, anchorResult] = await Promise.allSettled([
          readStats(),
          readLedger(200),
          fetch(`${APEX_BASE}/blockchain-anchor?action=history`).then((r) => {
            if (!r.ok) throw new Error(`anchor history ${r.status}`);
            return r.json() as Promise<{ anchors?: Anchor[]; confirmed?: number; pending?: number }>;
          }),
        ]);

        const platformSeals = statsResult.status === "fulfilled" ? statsResult.value.entries : null;
        const entries = entriesResult.status === "fulfilled" ? entriesResult.value : [];
        const anchorData = anchorResult.status === "fulfilled" ? anchorResult.value : null;
        const anchors = anchorData?.anchors ?? [];
        const latest = anchors.find((a) => a.block_height) ?? anchors[0] ?? null;

        const foundingSeals = FOUNDING_SEALS.length;

        const events = [
          ...FOUNDING_SEALS.map((s) => ({
            kind: "seal" as const,
            at: s.timestamp,
            label: s.title,
            reference: s.receiptId,
            detail: s.hash,
            source: "apex-psi",
          })),
          ...entries.map((e) => ({
            kind: "seal" as const,
            at: e.created_at,
            label: `Receipt sealed · ${e.anchor_status}`,
            reference: e.receipt_id,
            detail: e.content_hash,
            source: "platform-ledger",
          })),
          ...anchors
            .filter((a) => a.bitcoin_txid)
            .map((a) => ({
              kind: "anchor" as const,
              at: a.confirmed_at ?? a.created_at ?? new Date(0).toISOString(),
              label: a.block_height
                ? `Merkle root anchored at Bitcoin block ${a.block_height}`
                : "Merkle root submitted to Bitcoin",
              reference: a.bitcoin_txid ?? "",
              detail: a.anchor_hash,
              source: "bitcoin",
              block_height: a.block_height,
            })),
        ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

        const series = [
          ...FOUNDING_SEALS.map((s) => s.timestamp),
          ...entries.map((e) => e.created_at),
        ].sort();

        return signedJson({
          origin: "sovereign-ai.services/ledger-stats",
          founded_at: "2026-08-22T10:43:09Z",
          founding_seals: foundingSeals,
          platform_seals: platformSeals,
          total_seals: platformSeals === null ? null : platformSeals + foundingSeals,
          confirmed_anchors: anchorData?.confirmed ?? null,
          pending_anchors: anchorData?.pending ?? null,
          latest_block_height: latest?.block_height ?? null,
          latest_anchor_txid: latest?.bitcoin_txid ?? null,
          enforcement_actions_recorded: 0,
          events: events.slice(0, 10),
          seal_timestamps: series,
          derivation:
            "total_seals = rows in the public notarisations table + the three APEX PSI founding seals. Anchor figures are the APEX PSI blockchain-anchor history verbatim. Nothing here is modelled.",
        });
      },
    },
  },
});
