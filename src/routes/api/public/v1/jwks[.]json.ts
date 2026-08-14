import { createFileRoute } from "@tanstack/react-router";
import { CORS_PREFLIGHT, nationJwks } from "@/lib/nation-key.server";

export const Route = createFileRoute("/api/public/v1/jwks.json")({
  server: {
    handlers: {
      OPTIONS: () => CORS_PREFLIGHT.clone(),
      GET: async () =>
        new Response(JSON.stringify(await nationJwks(), null, 2), {
          headers: {
            "content-type": "application/jwk-set+json; charset=utf-8",
            "access-control-allow-origin": "*",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
});
