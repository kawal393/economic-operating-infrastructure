import { createFileRoute } from "@tanstack/react-router";
import { readLedger, readStats } from "@/lib/ledger.server";
import { CORS_PREFLIGHT, signedJson } from "@/lib/nation-key.server";

/** Full mirror surface: anyone may replicate the ledger and outlive us. */
export const Route = createFileRoute("/api/public/v1/ledger")({
  server: {
    handlers: {
      OPTIONS: () => CORS_PREFLIGHT.clone(),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 100) || 100, 1), 500);
        const [entries, stats] = await Promise.all([readLedger(limit), readStats()]);
        return signedJson({
          origin: "sovereign-ai.services/ledger",
          stats,
          count: entries.length,
          entries,
          mirror_policy:
            "Replicate freely. A mirror that disagrees with our signed checkpoint is evidence against us, and we publish the checkpoint anyway.",
        });
      },
    },
  },
});
