import { createFileRoute } from "@tanstack/react-router";
import { readEntry } from "@/lib/ledger.server";
import { CORS_PREFLIGHT, signedJson } from "@/lib/nation-key.server";

export const Route = createFileRoute("/api/public/v1/receipt/$receiptId")({
  server: {
    handlers: {
      OPTIONS: () => CORS_PREFLIGHT.clone(),
      GET: async ({ params }) => {
        const entry = await readEntry(String(params.receiptId ?? ""));
        if (!entry) {
          return signedJson({ error: "not_found" }, { status: 404, cacheSeconds: 0 });
        }
        return signedJson({
          ...entry,
          permalink: `https://sovereign-ai.services/r/${entry.receipt_id}`,
          badge: `https://sovereign-ai.services/api/public/badge/${entry.content_hash}.svg`,
          proof: `https://sovereign-ai.services/api/public/v1/proof/${entry.receipt_id}`,
        });
      },
    },
  },
});
