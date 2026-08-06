import { createFileRoute } from "@tanstack/react-router";
import { readLedger } from "@/lib/ledger.server";

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * The Proof Feed. Every seal is published as a syndicatable item, so
 * aggregators, newsrooms, bots and blogs can carry the chain automatically.
 */
export const Route = createFileRoute("/feed[.]xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        let entries: Awaited<ReturnType<typeof readLedger>> = [];
        try {
          entries = await readLedger(50);
        } catch {
          entries = [];
        }

        const items = entries
          .map((entry) => {
            const link = `${origin}/r/${entry.receipt_id}`;
            const title = `Seal #${entry.sequence} — ${entry.content_hash.slice(0, 16)}…`;
            const description = `An artefact was sealed under Apex PSI and appended to the public chain at position #${entry.sequence}. Digest ${entry.content_hash}. Chain hash ${entry.chain_hash}. Bitcoin anchor: ${entry.anchor_status}. Integrity proven; truth not verified.`;
            return `    <item>
      <title>${esc(title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      <pubDate>${new Date(entry.created_at).toUTCString()}</pubDate>
      <description>${esc(description)}</description>
    </item>`;
          })
          .join("\n");

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
    <title>Sovereign AI Services — Proof Feed</title>
    <link>${esc(origin)}/ledger</link>
    <description>Every seal appended to the public Apex PSI notarisation chain, as it happens.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel></rss>`;

        return new Response(body, {
          headers: {
            "content-type": "application/rss+xml; charset=utf-8",
            "cache-control": "public, max-age=300",
            "access-control-allow-origin": "*",
          },
        });
      },
    },
  },
});
