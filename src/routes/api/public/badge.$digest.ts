import { createFileRoute } from "@tanstack/react-router";
import { findByDigest } from "@/lib/ledger.server";

const GOLD = "#c99a3b";

function svg(label: string, value: string, tone: string) {
  const width = 132 + value.length * 6.6;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width.toFixed(0)}" height="28" role="img" aria-label="${label}: ${value}">
  <rect width="${width.toFixed(0)}" height="28" rx="4" fill="#0a0a0f"/>
  <rect x="0.5" y="0.5" width="${(width - 1).toFixed(0)}" height="27" rx="3.5" fill="none" stroke="#2a2a2f"/>
  <circle cx="16" cy="14" r="5" fill="none" stroke="${tone}" stroke-width="1.6"/>
  <circle cx="16" cy="14" r="1.8" fill="${tone}"/>
  <text x="28" y="18" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Helvetica,Arial" font-size="11" fill="#a0a0a0">${label}</text>
  <text x="${(28 + label.length * 6.1).toFixed(0)}" y="18" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" fill="${tone}">${value}</text>
</svg>`;
}

/**
 * Live verification badge. Every site that embeds it renders our proof state
 * and links back to the permalink — the propagation surface of the protocol.
 */
export const Route = createFileRoute("/api/public/badge/$digest")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const digest = (params.digest ?? "").replace(/\.svg$/, "").toLowerCase();
        const headers = {
          "content-type": "image/svg+xml; charset=utf-8",
          "cache-control": "public, max-age=300, s-maxage=300",
          "access-control-allow-origin": "*",
        };

        if (!/^[0-9a-f]{64}$/.test(digest)) {
          return new Response(svg("Sovereign AI", "invalid digest", "#a0a0a0"), { headers });
        }

        try {
          const entries = await findByDigest(digest);
          if (entries.length === 0) {
            return new Response(svg("Sovereign AI", "unsealed", "#a0a0a0"), { headers });
          }
          const entry = entries[0]!;
          const value =
            entry.anchor_status === "confirmed" || entry.anchor_status === "anchored"
              ? `sealed · bitcoin #${entry.sequence}`
              : `sealed · chain #${entry.sequence}`;
          return new Response(svg("Sovereign AI", value, GOLD), { headers });
        } catch {
          return new Response(svg("Sovereign AI", "unavailable", "#a0a0a0"), { headers });
        }
      },
    },
  },
});
