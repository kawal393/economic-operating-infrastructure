import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Activity, Anchor, BadgeCheck, Rocket, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, Section, StatBlock } from "@/components/primitives";
import { shortAddress, useWallet } from "@/lib/wallet";
import { useAuth } from "@/hooks/useAuth";
import { getMyCitizen } from "@/lib/citizen.functions";
import { getLedgerStats } from "@/lib/ledger.functions";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Citizen Dashboard | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Track deployed nation-states, verifications, Bitcoin anchors, surplus routing and governance participation from your citizen dashboard.",
      },
      { property: "og:title", content: "Citizen Dashboard" },
      {
        property: "og:description",
        content: "Nation-states, verifications, anchors, surplus routing and governance in one view.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/dashboard" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
  component: DashboardPage,
});

const ACTIVITY = [
  { time: "2m ago", event: "Verification sealed", detail: "sha256:9f2c…41ab · psi-media v3.0.0" },
  { time: "14m ago", event: "Bitcoin anchor committed", detail: "Merkle root · block 932,141" },
  { time: "1h ago", event: "Surplus routed", detail: "1,204.88 units · Article III graph" },
  { time: "3h ago", event: "Compliance check passed", detail: "psi-finance v2.0.3 · EU_ART_50" },
  { time: "6h ago", event: "Nation-state deployed", detail: "ns_4f1a9c2b7e08d135" },
  { time: "1d ago", event: "Governance vote cast", detail: "Proposal PSI-A-014 · For" },
];

const TRANSACTIONS = [
  ["tx_9a41", "Verification", "$0.001", "Settled", "2026-08-06 08:51"],
  ["tx_9a3f", "Anchor", "$0.010", "Settled", "2026-08-06 08:39"],
  ["tx_9a2d", "Surplus routing", "$1.205", "Settled", "2026-08-06 07:44"],
  ["tx_9a18", "Compliance", "$0.100", "Settled", "2026-08-06 05:12"],
  ["tx_99f4", "Verification", "$0.001", "Settled", "2026-08-05 23:08"],
];

function DashboardPage() {
  const { address, connecting, connect } = useWallet();
  const { user } = useAuth();
  const citizenFn = useServerFn(getMyCitizen);
  const statsFn = useServerFn(getLedgerStats);

  const { data: citizen } = useQuery({
    queryKey: ["citizen", user?.id ?? null],
    queryFn: () => citizenFn({}),
    enabled: Boolean(user),
  });
  const { data: stats } = useQuery({ queryKey: ["ledger-stats"], queryFn: () => statsFn({}) });

  return (
    <>
      <PageHeader
        eyebrow="Citizen Dashboard"
        title="Your standing in the nation-state"
        description="Deployment, verification, anchoring, surplus routing and governance participation — measured, not narrated."
      >
        <button
          type="button"
          onClick={connect}
          disabled={connecting}
          className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/20 disabled:opacity-60"
        >
          <Wallet className="h-4 w-4" />
          {connecting ? "Connecting…" : shortAddress(address)}
        </button>
      </PageHeader>

      <Section className="py-14">
        <Panel className="mb-4 flex flex-wrap items-center justify-between gap-4 p-6 text-sm">
          {citizen ? (
            <>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Citizen record</p>
                <p className="mt-1 font-semibold text-foreground">
                  {citizen.display_name}{" "}
                  <span className="text-muted-foreground">
                    · {citizen.is_ai ? "AI citizen" : "human citizen"}
                  </span>
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {citizen.territory ?? "territory undeclared"}
                </p>
              </div>
              <Link to="/citizenship" className="text-xs font-semibold text-gold">
                Amend record →
              </Link>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                No citizen record is bound to this browser yet. Sealing and verification remain free
                and keyless.
              </p>
              <Link
                to={user ? "/citizenship" : "/auth"}
                search={user ? undefined : { redirect: "/citizenship" }}
                className="rounded-md border border-gold/40 px-3 py-1.5 text-xs font-semibold text-gold"
              >
                {user ? "Register citizenship" : "Sign in"}
              </Link>
            </>
          )}
        </Panel>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBlock label="Chain entries" value={String(stats?.entries ?? 0)} delta="live" />
          <StatBlock label="Registered citizens" value={String(stats?.citizens ?? 0)} delta="live" />
          <StatBlock label="Nation-states" value={String(stats?.nationStates ?? 0)} delta="live" />
          <StatBlock
            label="Fees recorded"
            value={`$${(stats?.feesUsd ?? 0).toFixed(3)}`}
            delta="live"
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {[
            { icon: Rocket, label: "Deploy Nation-State", to: "/deploy" as const },
            { icon: BadgeCheck, label: "Seal something", to: "/seal" as const },
            { icon: Anchor, label: "Propagation console", to: "/amplify" as const },
          ].map((action) => (
            <Link key={action.label} to={action.to}>
              <Panel interactive className="flex items-center gap-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gold/25 bg-gold/10">
                  <action.icon className="h-4.5 w-4.5 text-gold" />
                </span>
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </Panel>
            </Link>
          ))}
        </div>
      </Section>


      <Section className="bg-surface/30">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Panel className="p-7">
            <p className="eyebrow">Transaction history</p>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border">
                    {["ID", "Type", "Amount", "Status", "Timestamp"].map((h) => (
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
                  {TRANSACTIONS.map((row) => (
                    <tr key={row[0]}>
                      <td className="py-3.5 pr-6 font-mono text-xs text-gold">{row[0]}</td>
                      <td className="py-3.5 pr-6 text-sm text-foreground">{row[1]}</td>
                      <td className="py-3.5 pr-6 font-mono text-sm text-foreground">{row[2]}</td>
                      <td className="py-3.5 pr-6 font-mono text-xs text-success">{row[3]}</td>
                      <td className="py-3.5 font-mono text-xs text-muted-foreground">{row[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link
              to="/transactions"
              className="mt-6 inline-block text-sm font-medium text-gold hover:underline"
            >
              View all transactions
            </Link>
          </Panel>

          <Panel className="p-7">
            <p className="eyebrow">Recent activity</p>
            <ul className="mt-5 space-y-5">
              {ACTIVITY.map((item, i) => (
                <li key={i} className="flex gap-4">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.event}</p>
                    <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                      {item.detail}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {item.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </Section>

      <Section>
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel className="p-7">
            <p className="eyebrow">Governance</p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">Open proposals</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Two proposals are within their deliberation window. Your vote carries full citizen
              weight regardless of citizenship type.
            </p>
            <Link
              to="/governance"
              className="mt-6 inline-flex rounded-md border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
            >
              Open governance
            </Link>
          </Panel>

          <Panel className="p-7">
            <div className="flex items-center gap-3">
              <Activity className="h-4.5 w-4.5 text-gold" />
              <p className="eyebrow">Surplus routing</p>
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">Article III status</h2>
            <dl className="mt-5 space-y-4">
              {[
                ["Sufficiency floor", "1,200 units / window"],
                ["Current position", "1,684 units (surplus 484)"],
                ["Routing state", "Active — auto-routing enabled"],
                ["Protocol fee", "0.1% of routed surplus"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="font-mono text-sm text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={() =>
                toast.success("Routing preferences saved", {
                  description: "Sufficiency floor re-signed and anchored.",
                })
              }
              className="mt-6 rounded-md border border-border bg-secondary/40 px-5 py-2.5 text-sm font-medium transition-colors hover:border-gold/40 hover:text-gold"
            >
              Re-sign sufficiency floor
            </button>
          </Panel>
        </div>
      </Section>
    </>
  );
}
