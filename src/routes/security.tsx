import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader, Panel, Section, SectionHeading, StatBlock, StatusDot } from "@/components/primitives";
import { getThreatSummary } from "@/lib/security.functions";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "The Sentinel — Live Defence of the Platform | Sovereign AI Services" },
      {
        name: "description",
        content:
          "The Sentinel is the defence layer of sovereign-ai.services: prompt-injection walls, rate limiting, row-level isolation, an append-only threat log and a charter-level kill switch.",
      },
      { property: "og:title", content: "The Sentinel — live defence of the workspace" },
      {
        property: "og:description",
        content:
          "Injection walls, rate limits, row-level isolation and a public threat log. Defence in the open, because secrecy is not security.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/security" }],
  }),
  component: SecurityPage,
});

const WALLS = [
  {
    layer: "01",
    name: "Injection wall",
    body: "Twelve signature families — instruction override, system-prompt exfiltration, secret harvesting, role escalation, guard-rail disable, impersonation, SQL injection, XSS, path traversal, command injection and tool smuggling — are matched against every transcript line and every tool argument before either reaches the state.",
    posture: "Refuse, log, continue.",
  },
  {
    layer: "02",
    name: "Atomic rate limiting",
    body: "A single-statement PostgreSQL function consumes a token bucket inside one transaction, so concurrent requests cannot race past the ceiling. Buckets are keyed per member or per hashed caller fingerprint; raw addresses are never stored.",
    posture: "8 voice audiences/hour, 120 reads and 20 writes per 5 minutes.",
  },
  {
    layer: "03",
    name: "Row-level isolation",
    body: "Every table in the nation runs row-level security with explicit grants. The ledger is deliberately world-readable and has no insert, update or delete policy at all — writes exist only through a server-only, advisory-locked append function.",
    posture: "Public to read. Impossible to rewrite.",
  },
  {
    layer: "04",
    name: "Least-privilege execution",
    body: "Role checks run through a security-definer function against a separate roles table, never a column on a profile. Privileged database functions are revoked from anon and authenticated and granted only to the server role.",
    posture: "No client holds a power the server would not grant it.",
  },
  {
    layer: "05",
    name: "Tamper-evident threat log",
    body: "Blocked attempts are written to an append-only security log with severity, signature family and a hashed fingerprint of the caller. Aggregates are published here; raw payloads are visible only to the Ministry of Defence.",
    posture: "Attacks become public evidence.",
  },
  {
    layer: "06",
    name: "Charter-level kill switch",
    body: "Global flags can take the Platform steward offline, suspend its write powers, or raise the nation to lockdown, in which no agent-mediated governance action is accepted regardless of authority.",
    posture: "Article V: the protocol refuses power it could abuse.",
  },
];

const SEVERITY_ORDER = ["critical", "high", "medium", "low", "info"] as const;

function SecurityPage() {
  const summaryFn = useServerFn(getThreatSummary);
  const summary = useQuery({
    queryKey: ["threat-summary"],
    queryFn: () => summaryFn(),
    refetchInterval: 30_000,
  });

  const data = summary.data;
  const posture = data?.posture ?? "NORMAL";

  return (
    <>
      <PageHeader
        eyebrow="Ministry of defence · the Sentinel"
        title="Defence, conducted in the open"
        description="A nation whose security depends on nobody looking is not secure. The Sentinel publishes its posture, its walls and its blocked-attempt counts, and keeps only the raw attack payloads private."
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] ${
              posture === "NORMAL"
                ? "border-success/40 text-success"
                : posture === "ELEVATED"
                  ? "border-warning/50 text-warning"
                  : "border-danger/50 text-danger"
            }`}
          >
            <StatusDot active={posture === "NORMAL"} />
            posture · {posture}
          </span>
          <Link
            to="/steward"
            className="rounded-md border border-gold/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-gold"
          >
            Platform steward · {data?.agentEnabled === false ? "offline" : "online"}
          </Link>
        </div>
      </PageHeader>

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBlock label="Blocked · 24h" value={String(data?.blocked24h ?? 0)} />
          <StatBlock
            label="Critical signatures"
            value={String(data?.bySeverity?.["critical"] ?? 0)}
          />
          <StatBlock label="High signatures" value={String(data?.bySeverity?.["high"] ?? 0)} />
          <StatBlock
            label="Agent writes"
            value={data?.agentWriteEnabled === false ? "SUSPENDED" : "ENABLED"}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel>
            <p className="eyebrow">Signature families · last 24 hours</p>
            {data?.byKind?.length ? (
              <ul className="mt-4 space-y-3">
                {data.byKind.map((row) => (
                  <li key={row.kind} className="flex items-center gap-3">
                    <span className="w-44 shrink-0 font-mono text-xs text-foreground">
                      {row.kind}
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                      <span
                        className="block h-full bg-gold"
                        style={{
                          width: `${Math.min(100, (row.count / (data.byKind[0]?.count || 1)) * 100)}%`,
                        }}
                      />
                    </span>
                    <span className="w-8 text-right font-mono text-xs text-muted-foreground">
                      {row.count}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No blocked attempts in the last 24 hours. The walls stay up regardless.
              </p>
            )}
          </Panel>

          <Panel>
            <p className="eyebrow">Severity distribution</p>
            <ul className="mt-4 space-y-3">
              {SEVERITY_ORDER.map((severity) => (
                <li key={severity} className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {severity}
                  </span>
                  <span className="font-mono text-sm text-foreground">
                    {data?.bySeverity?.[severity] ?? 0}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-border/60 pt-4 text-xs leading-relaxed text-muted-foreground">
              Counts are aggregates. Attack payloads, caller addresses and account identifiers are
              never published — only a truncated one-way fingerprint is retained.
            </p>
          </Panel>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Six walls"
          title="What stands between an attacker and the record"
          description="Each layer fails closed and logs. None of them depends on an attacker not knowing it exists."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {WALLS.map((wall) => (
            <Panel key={wall.layer} interactive className="flex flex-col">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
                {wall.layer} · {wall.name}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {wall.body}
              </p>
              <p className="mt-4 border-t border-border/60 pt-3 font-mono text-[11px] text-foreground/80">
                {wall.posture}
              </p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section className="border-b-0">
        <Panel className="border-gold/25">
          <SectionHeading
            eyebrow="Disclosure"
            title="Found a way through?"
            description="Seal your finding with Apex PSI and publish the receipt. A timestamped, hash-linked disclosure is unfalsifiable evidence of both the flaw and the date you found it — and it is the only bug report this nation treats as a matter of record."
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/seal"
              className="rounded-md bg-gold px-4 py-2 text-xs font-semibold text-background"
            >
              Seal a disclosure
            </Link>
            <Link
              to="/ledger"
              className="rounded-md border border-border px-4 py-2 text-xs font-semibold text-foreground"
            >
              Read the chain
            </Link>
          </div>
        </Panel>
      </Section>
    </>
  );
}
