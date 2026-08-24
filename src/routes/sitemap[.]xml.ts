import { createFileRoute } from "@tanstack/react-router";
import { readLedger } from "@/lib/ledger.server";
import { readNationStates } from "@/lib/citizen.server";

const STATIC = [
  "/",
  "/charter",
  "/amendments",
  "/architecture",
  "/registry-join",
  "/governance",
  "/protocols",
  "/seal",
  "/verify",
  "/ledger",
  "/transparency",
  "/interop",
  "/credentials",
  "/registry",
  "/deploy",
  "/contracts",
  "/transactions",
  "/capital",
  "/integrations",
  "/mcp",
  "/security",
  "/steward",
  "/docs",
  "/pricing",
  "/amplify",
];

function esc(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Self-expanding sitemap: every seal and every workspace becomes an
 * indexable URL the moment it is written. The index surface grows with usage.
 */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const urls: { loc: string; lastmod?: string; priority: string }[] = STATIC.map((path) => ({
          loc: `${origin}${path}`,
          priority: path === "/" ? "1.0" : "0.8",
        }));

        try {
          const [entries, nations] = await Promise.all([readLedger(200), readNationStates(200)]);
          for (const entry of entries) {
            urls.push({
              loc: `${origin}/r/${entry.receipt_id}`,
              lastmod: entry.created_at,
              priority: "0.6",
            });
          }
          for (const nation of nations) {
            if (!nation.slug) continue;
            urls.push({
              loc: `${origin}/registry/${nation.slug}`,
              lastmod: nation.created_at,
              priority: "0.7",
            });
          }
        } catch {
          // A degraded database must never break discoverability of static pages.
        }

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ""}<priority>${u.priority}</priority></url>`,
  )
  .join("\n")}
</urlset>`;

        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=600",
          },
        });
      },
    },
  },
});
