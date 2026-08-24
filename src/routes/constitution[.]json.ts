import { createFileRoute } from "@tanstack/react-router";

/** Permanent redirect — the machine-readable Charter now lives at /charter.json. */
export const Route = createFileRoute("/constitution.json")({
  server: {
    handlers: {
      GET: () =>
        new Response(null, {
          status: 301,
          headers: { location: "/charter.json", "cache-control": "public, max-age=3600" },
        }),
    },
  },
});
