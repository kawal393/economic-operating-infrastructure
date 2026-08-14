import { createFileRoute } from "@tanstack/react-router";
import { proofFor } from "@/lib/transparency.server";
import { CORS_PREFLIGHT, signedJson } from "@/lib/nation-key.server";

export const Route = createFileRoute("/api/public/v1/proof/$receiptId")({
  server: {
    handlers: {
      OPTIONS: () => CORS_PREFLIGHT.clone(),
      GET: async ({ params }) => {
        const proof = await proofFor(String(params.receiptId ?? ""));
        if (!proof) {
          return signedJson(
            { error: "not_found", message: "No ledger leaf carries that receipt id." },
            { status: 404, cacheSeconds: 0 },
          );
        }
        return signedJson(proof, { cacheSeconds: 30 });
      },
    },
  },
});
