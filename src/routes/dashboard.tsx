import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Anchor, BadgeCheck, Rocket, Wallet } from "lucide-react";
import { PageHeader, Panel, Section, StatBlock } from "@/components/primitives";
import { shortAddress, useWallet } from "@/lib/wallet";
import { useAuth } from "@/hooks/useAuth";
import { getMyCitizen } from "@/lib/citizen.functions";
import { getLedger, getLedgerStats } from "@/lib/ledger.functions";
import { getAmendments } from "@/lib/constitution.functions";
import { ARTICLE3_STATUS, CUSTODY_FENCE } from "@/content/legal";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Member Dashboard | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Your member record, the latest entries of the public ledger and the live amendment window. Every figure on this page is read from the public record at load; nothing here is simulated.",
      },
      { property: "og:title", content: "Member Dashboard" },
      {
        property: "og:description",
        content:
          "Member record, live ledger entries and the amendment window, read from the public record.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/dashboard" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
  component: DashboardPage,
});

// NO ACTIVITY FEED AND NO TRANSACTION HISTORY ARE DEFINED HERE.
//
// This file used to hardcode both. The activity feed claimed “Surplus routed
// 1,204.88 units”, “Bitcoin anchor committed · block 932,141” (the live chain was
// at 963,516 and anchors are batched at the Merkle root, so no per-event block
// number existed to print) and “Governance vote cast · Proposal PSI-A-014 · For”
// (PSI-A-014 is a specimen on /governance; no ballot has ever opened). The
// transaction table printed five settled rows with ids and dollar amounts typed
// into the source. None of it came from a database, a receipt or a signature.
//
// What is below instead is read from the public ledger at load, and a stranger
// can check every row without an account, a key or our permission.

function DashboardPage() {
  const { address, connecting, connect } = useWallet();
  const { user } = useAuth();
  const citizenFn = useServerFn(getMyCitizen);
  const statsFn = useServerFn(getLedgerStats);
  const ledgerFn = useServerFn(getLedger);
  const amendmentsFn = useServerFn(getAmendments);

  const { data: member } = useQuery({
    queryKey: ["member", user?.id ?? null],
    queryFn: () => citizenFn({}),
    enabled: Boolean(user),
  });
  const { data: stats } = useQuery({ queryKey: ["ledger-stats"], queryFn: () => statsFn({}) });
  const { data: ledgerData } = useQuery({
    queryKey: ["ledger", 6],
    queryFn: () => ledgerFn({ data: { limit: 6 } }),
    refetchInterval: 20_000,
  });
  const { data: amendmentData } = useQuery({
    queryKey: ["amendments"],
    queryFn: () => amendmentsFn(),
  });

  const ledger = ledgerData ?? [];
  const amendments = amendmentData ?? [];
  const openCount = amendments.filter((a) => new Date(a.closes_at).getTime() >= Date.now()).length;

  return (
    <>
      <PageHeader
        eyebrow="Member Dashboard"
        title="Your standing in the workspace"
        description="Your member record, the latest entries of the public ledger and the amendment window. Nothing here is narrated: every figure below is read from the public record at load, and every row can be checked by a stranger with no account."
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
          {member ? (
            <>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Member record
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {member.display_name}{" "}
                  <span className="text-muted-foreground">
                    · {member.is_ai ? "AI member" : "human member"}
                  </span>
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {member.territory ?? "namespace undeclared"}
                </p>
              </div>
              <Link to="/registry-join" className="text-xs font-semibold text-gold">
                Amend record →
              </Link>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                No member record is bound to this browser yet. Sealing and verification remain free
                and keyless.
              </p>
              <Link
                to={user ? "/registry-join" : "/auth"}
                search={user ? {} : { redirect: "/registry-join" }}
                className="rounded-md border border-gold/40 px-3 py-1.5 text-xs font-semibold text-gold"
              >
                {user ? "Register registry membership" : "Sign in"}
              </Link>
            </>
          )}
        </Panel>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBlock label="Chain entries" value={String(stats?.entries ?? 0)} delta="live" />
          <StatBlock label="Registered members" value={String(stats?.citizens ?? 0)} delta="live" />
          <StatBlock label="Workspaces" value={String(stats?.nationStates ?? 0)} delta="live" />
          <StatBlock
            label="Fees recorded"
            value={`$${(stats?.feesUsd ?? 0).toFixed(3)}`}
            delta="live"
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {[
            { icon: Rocket, label: "Deploy Workspace", to: "/deploy" as const },
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
            <p className="eyebrow">Latest ledger entries — read live</p>
            {ledger.length === 0 ? (
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                No entries returned on this load. This panel reads the same public table the rest of
                the world reads, with no key and no account.
              </p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border">
                      {["Seq", "Receipt", "Digest", "Anchor", "Sealed"].map((h) => (
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
                    {ledger.map((e) => (
                      <tr key={e.receipt_id}>
                        <td className="py-3.5 pr-6 font-mono text-xs text-muted-foreground">
                          {e.sequence}
                        </td>
                        <td className="py-3.5 pr-6 font-mono text-xs text-gold">
                          <Link to="/r/$receiptId" params={{ receiptId: e.receipt_id }}>
                            {e.receipt_id}
                          </Link>
                        </td>
                        <td className="py-3.5 pr-6 font-mono text-xs text-foreground">
                          {e.content_hash.slice(0, 12)}…{e.content_hash.slice(-6)}
                        </td>
                        <td className="py-3.5 pr-6 font-mono text-xs text-muted-foreground">
                          {e.anchor_status}
                        </td>
                        <td className="py-3.5 font-mono text-xs text-muted-foreground">
                          {new Date(e.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Link
              to="/ledger"
              className="mt-6 inline-block text-sm font-medium text-gold hover:underline"
            >
              Open the full public ledger
            </Link>
          </Panel>

          <Panel className="border-warning/40 bg-warning/5 p-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-warning">
              What this page no longer shows
            </p>
            <p className="mt-3.5 text-sm leading-relaxed text-foreground">
              This dashboard used to carry an activity feed and a transaction history. The feed
              claimed surplus had been routed, that a Bitcoin anchor had committed at block 932,141,
              and that a vote had been cast on proposal PSI-A-014. The table printed five settled
              transactions with ids and dollar amounts. None of it came from a database, a receipt
              or a signature: the block number contradicted the live chain, the amounts were typed
              into the source file, and PSI-A-014 is a specimen on the governance page that has
              never been to a ballot. Both panels are deleted rather than relabelled, because a
              figure with no source cannot be made honest by writing “modelled” beside it. What is
              left is the ledger above, which anyone can check without us.
            </p>
          </Panel>
        </div>
      </Section>

      <Section>
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel className="p-7">
            <p className="eyebrow">Governance</p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">The amendment window</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {openCount === 0
                ? "No amendment is inside its deliberation window right now — this count is read from the public record at load, not written into the page."
                : `${openCount} amendment${openCount === 1 ? "" : "s"} inside the fourteen-day deliberation window, counted from the public record at load.`}{" "}
              Every proposal ever tabled stays on the public record, including the ones that fail.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/amendments"
                className="inline-flex rounded-md border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
              >
                Live amendment record
              </Link>
              <Link
                to="/governance"
                className="inline-flex rounded-md border border-border bg-secondary/40 px-5 py-2.5 text-sm font-medium transition-colors hover:border-gold/40 hover:text-gold"
              >
                The procedure
              </Link>
            </div>
          </Panel>

          <Panel className="p-7">
            <p className="eyebrow">Articles III and IV</p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">
              Surplus routing is charter text, not machinery
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{ARTICLE3_STATUS}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{CUSTODY_FENCE}</p>
            <p className="mt-5 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
              This panel used to print a sufficiency floor of 1,200 units, a position of 1,684 with
              a surplus of 484, a routing state of “Active — auto-routing enabled”, and a button
              that reported “re-signed and anchored” while calling nothing at all. No unit exists,
              no meter exists, no member has declared a floor, and nothing was signed. Both Articles
              are in force as published text; neither has an implementation behind it.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/charter"
                className="inline-flex rounded-md border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
              >
                Read the sealed text
              </Link>
              <Link
                to="/amendments"
                className="inline-flex rounded-md border border-border bg-secondary/40 px-5 py-2.5 text-sm font-medium transition-colors hover:border-gold/40 hover:text-gold"
              >
                Propose an amendment
              </Link>
            </div>
          </Panel>
        </div>
      </Section>
    </>
  );
}
