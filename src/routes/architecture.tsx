import { createFileRoute } from "@tanstack/react-router";
import { Scale, Bitcoin, ShieldCheck, Boxes, Users, Globe } from "lucide-react";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { BRANCHES } from "@/content/nation";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "System architecture — Six Organs of the Workspace | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Legislative Protocol Engine, Judicial Bitcoin anchoring, post-quantum Military, 21 Executive industry protocols, AI and human Members, and sovereign-ai.* Namespace.",
      },
      { property: "og:title", content: "System architecture of the Workspace" },
      {
        property: "og:description",
        content: "Six organs. Separated powers. Each bounded by what it can prove.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/government" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/government" }],
  }),
  component: GovernmentPage,
});

const ICONS: Record<string, typeof Scale> = {
  legislative: Scale,
  judicial: Bitcoin,
  military: ShieldCheck,
  executive: Boxes,
  members: Users,
  namespace: Globe,
};

function GovernmentPage() {
  return (
    <>
      <PageHeader
        eyebrow="System architecture"
        title="Six organs. Separated powers. No discretionary centre."
        description="The system architecture is designed around a single assumption: whoever ends up holding the keys will eventually misuse them. Every organ is therefore bounded by what it can cryptographically prove, and by nothing softer."
      />

      <Section>
        <div className="grid gap-4 lg:grid-cols-2">
          {BRANCHES.map((branch) => {
            const Icon = ICONS[branch.id] ?? Scale;
            return (
              <Panel key={branch.id} interactive className="flex flex-col p-7">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-gold/25 bg-gold/10">
                    <Icon className="h-5 w-5 text-gold" />
                  </span>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {branch.branch}
                    </p>
                    <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">
                      {branch.organ}
                    </h2>
                    <p className="mt-1.5 text-sm font-medium text-gold">{branch.mandate}</p>
                  </div>
                </div>

                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  {branch.detail}
                </p>

                <div className="mt-6 border-t border-border pt-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Enumerated powers
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {branch.powers.map((p) => (
                      <li key={p} className="flex gap-3 text-sm text-foreground/85">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Panel>
            );
          })}
        </div>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Separation of Powers"
          title="What each organ is forbidden from doing"
          description="Enumerated powers matter less than enumerated prohibitions. These are the constraints that make capture unprofitable."
        />

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3.5 pr-6 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  Organ
                </th>
                <th className="py-3.5 pr-6 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  May not
                </th>
                <th className="py-3.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  Checked by
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                [
                  "Protocol Engine",
                  "Amend Articles I or V without unanimity of active workspaces",
                  "Members",
                ],
                [
                  "Bitcoin Anchoring",
                  "Rule on truth, intent or merit — only on existence before a block",
                  "The Bitcoin network",
                ],
                [
                  "Post-Quantum Crypto",
                  "Accept a seal where only one of the two signature schemes verifies",
                  "Public verifiers",
                ],
                [
                  "21 Industry Protocols",
                  "Issue a statutory rule that contradicts a charter-level Article",
                  "Protocol Engine",
                ],
                [
                  "Members",
                  "Vote away another member's Article I or Article V standing",
                  "The Protocol Charter",
                ],
                [
                  "Namespace",
                  "Invalidate receipts issued under a previously bound Charter hash",
                  "Offline verification",
                ],
              ].map(([organ, prohibition, check]) => (
                <tr key={organ}>
                  <td className="py-4 pr-6 text-sm font-medium text-foreground">{organ}</td>
                  <td className="py-4 pr-6 text-sm leading-relaxed text-muted-foreground">
                    {prohibition}
                  </td>
                  <td className="py-4 font-mono text-xs text-gold">{check}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
