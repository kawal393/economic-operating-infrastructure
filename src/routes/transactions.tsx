import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, Panel, Section, SectionHeading, StatBlock } from "@/components/primitives";
import { FEES } from "@/content/nation";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transaction Dashboard — Protocol Revenue | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Microtransaction volume, fee mix and protocol revenue across verifications, Bitcoin anchors, compliance checks and surplus routing.",
      },
      { property: "og:title", content: "Transaction Dashboard" },
      {
        property: "og:description",
        content: "Microtransaction volume and protocol revenue at workspace scale.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/transactions" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/transactions" }],
  }),
  component: TransactionsPage,
});

const RANGES = ["24h", "7d", "30d", "12m"] as const;
type Range = (typeof RANGES)[number];

const SERIES: Record<Range, number[]> = {
  "24h": [42, 55, 38, 61, 74, 58, 82, 69, 91, 77, 88, 96],
  "7d": [58, 64, 51, 72, 80, 69, 94, 88, 76, 92, 99, 104],
  "30d": [30, 41, 52, 48, 66, 71, 63, 84, 79, 95, 108, 121],
  "12m": [12, 19, 27, 34, 45, 52, 68, 74, 89, 101, 128, 164],
};

const TOTALS: Record<Range, { volume: string; revenue: string; anchors: string; avg: string }> = {
  "24h": { volume: "41,208,996", revenue: "$62,104", anchors: "18,442", avg: "$0.0015" },
  "7d": { volume: "298,441,027", revenue: "$441,882", anchors: "129,004", avg: "$0.0015" },
  "30d": { volume: "1,284,930,551", revenue: "$1,912,447", anchors: "552,118", avg: "$0.0015" },
  "12m": { volume: "13,904,221,760", revenue: "$21,406,884", anchors: "6,201,884", avg: "$0.0015" },
};

const MIX = [
  { label: "Verification", share: 62, revenue: "$1.19M" },
  { label: "Bitcoin anchor", share: 18, revenue: "$344K" },
  { label: "Compliance check", share: 13, revenue: "$249K" },
  { label: "Surplus routing", share: 7, revenue: "$134K" },
];

const LEDGER = [
  ["tx_c8f21a", "Verification", "psi-media", "$0.001", "2026-08-06 09:14"],
  ["tx_c8f1e4", "Compliance", "psi-finance", "$0.100", "2026-08-06 09:13"],
  ["tx_c8f0b9", "Anchor", "core-anchor", "$0.010", "2026-08-06 09:12"],
  ["tx_c8ef77", "Surplus routing", "core-surplus", "$3.482", "2026-08-06 09:11"],
  ["tx_c8ee02", "Verification", "psi-health", "$0.001", "2026-08-06 09:10"],
  ["tx_c8ed55", "Verification", "psi-legal", "$0.001", "2026-08-06 09:09"],
  ["tx_c8ec13", "Compliance", "psi-energy", "$0.100", "2026-08-06 09:08"],
  ["tx_c8eb90", "Anchor", "core-anchor", "$0.010", "2026-08-06 09:07"],
];

function TransactionsPage() {
  const [range, setRange] = useState<Range>("30d");
  const series = SERIES[range];
  const max = useMemo(() => Math.max(...series), [series]);
  const totals = TOTALS[range];

  return (
    <>
      <PageHeader
        eyebrow="Transaction Dashboard"
        title="Revenue is a by-product of usefulness at scale"
        description="No subscriptions, no rent, no spread. Fractions of a cent, multiplied by billions of verifications the world actually needs."
      >
        <div className="inline-flex rounded-md border border-border bg-secondary/40 p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] transition-colors ${
                range === r ? "bg-gold/15 text-gold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </PageHeader>

      <Section className="py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBlock label="Transaction volume" value={totals.volume} delta={`window ${range}`} />
          <StatBlock label="Protocol revenue" value={totals.revenue} delta={`window ${range}`} />
          <StatBlock label="Bitcoin anchors" value={totals.anchors} delta={`window ${range}`} />
          <StatBlock label="Average fee" value={totals.avg} delta="per transaction" />
        </div>
      </Section>

      <Section className="bg-surface/30">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Panel className="p-7">
            <p className="eyebrow">Revenue trend — {range}</p>
            <div className="mt-8 flex h-56 items-end gap-2">
              {series.map((v, i) => (
                <div key={i} className="group flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-sm bg-gradient-to-t from-gold/25 to-gold transition-opacity group-hover:opacity-80"
                    style={{ height: `${(v / max) * 100}%` }}
                  />
                  <span className="font-mono text-[9px] text-muted-foreground">{i + 1}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Indexed protocol revenue per interval
            </p>
          </Panel>

          <Panel className="p-7">
            <p className="eyebrow">Fee mix</p>
            <ul className="mt-6 space-y-6">
              {MIX.map((m) => (
                <li key={m.label}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm text-foreground">{m.label}</span>
                    <span className="font-mono text-xs text-gold">{m.revenue}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div className="h-full bg-gold" style={{ width: `${m.share}%` }} />
                  </div>
                  <span className="mt-1.5 block font-mono text-[10px] text-muted-foreground">
                    {m.share}% of revenue
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Ledger"
          title="Live transaction stream"
          description="Each row is a metered protocol action with a signed receipt behind it."
        />
        <Panel className="mt-10 overflow-x-auto p-7">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {["ID", "Type", "Protocol", "Fee", "Timestamp"].map((h) => (
                  <th
                    key={h}
                    className="py-3 pr-6 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {LEDGER.map((row) => (
                <tr key={row[0]}>
                  <td className="py-3.5 pr-6 font-mono text-xs text-gold">{row[0]}</td>
                  <td className="py-3.5 pr-6 text-sm text-foreground">{row[1]}</td>
                  <td className="py-3.5 pr-6 font-mono text-xs text-muted-foreground">{row[2]}</td>
                  <td className="py-3.5 pr-6 font-mono text-sm text-foreground">{row[3]}</td>
                  <td className="py-3.5 font-mono text-xs text-muted-foreground">{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Schedule"
          title="What each action costs"
          description="Published, uniform, and identical for every member."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEES.map((fee) => (
            <Panel key={fee.label}>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {fee.label}
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-gold">{fee.price}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {fee.unit}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{fee.note}</p>
            </Panel>
          ))}
        </div>
      </Section>
    </>
  );
}
