import { createFileRoute } from "@tanstack/react-router";
import { currentCheckpoint, checkpointText } from "@/lib/transparency.server";
import { CORS_PREFLIGHT, signedJson } from "@/lib/nation-key.server";

export const Route = createFileRoute("/api/public/v1/checkpoint")({
  server: {
    handlers: {
      OPTIONS: () => CORS_PREFLIGHT.clone(),
      GET: async ({ request }) => {
        const cp = await currentCheckpoint();
        if (new URL(request.url).searchParams.get("format") === "text") {
          return new Response(checkpointText(cp), {
            headers: {
              "content-type": "text/plain; charset=utf-8",
              "access-control-allow-origin": "*",
              "cache-control": "public, max-age=30",
            },
          });
        }
        return signedJson(cp);
      },
    },
  },
});
