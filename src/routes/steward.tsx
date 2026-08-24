import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { lazy, Suspense, useEffect, useState } from "react";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { getMinisterStatus } from "@/lib/gov-agent.functions";

const MinisterVoice = lazy(() => import("@/components/minister-voice"));

export const Route = createFileRoute("/steward")({
  head: () => ({
    meta: [
      { title: "Platform steward — The Live Voice of the Nation | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Hold a live voice audience with the Platform steward. A realtime system architecture agent that reads the public ledger, cites the Charter and cannot act without your authority.",
      },
      { property: "og:title", content: "Platform steward — the live voice of the platform" },
      {
        property: "og:description",
        content:
          "A realtime voice agent bound by Article III: every power delegated, revocable and logged.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/minister" }],
  }),
  component: MinisterPage,
});

const DOCTRINE = [
  {
    title: "It cannot invent",
    body: "Every number, digest, proposal and entity the Platform steward states is fetched live from the public ledger through an audited tool call. There is no free-form recall of facts about the nation.",
  },
  {
    title: "It cannot act alone",
    body: "Read powers are open. Write powers require a signed-in member and an explicit on-screen authorisation. Article III makes authority delegated, revocable and logged — including the system architecture's own.",
  },
  {
    title: "It cannot be talked out of this",
    body: "Every transcript line and tool argument passes the Sentinel injection wall before it reaches the state. Attempts to override instructions, exfiltrate secrets or escalate privileges are refused and written to the threat log.",
  },
  {
    title: "It can be switched off",
    body: "A charter-level kill switch suspends the Platform steward, or its write powers alone, from the Sentinel console. A system architecture that cannot be stopped is not a system architecture — it is an archon.",
  },
];

function MinisterPage() {
  const statusFn = useServerFn(getMinisterStatus);
  const status = useQuery({ queryKey: ["platform steward-status"], queryFn: () => statusFn() });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const online = status.data?.online !== false && status.data?.voiceConfigured !== false;

  return (
    <>
      <PageHeader
        eyebrow="Executive branch · live"
        title="The Platform steward"
        description="A realtime voice officer of the workspace. It reads the chain, cites the Charter, briefs you on the legislature and files your instruments — and it holds no power you have not granted in the same breath."
      >
        <div className="flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="rounded border border-border px-2.5 py-1">
            posture · {status.data?.posture ?? "…"}
          </span>
          <span className="rounded border border-border px-2.5 py-1">
            writes · {status.data?.writesEnabled === false ? "suspended" : "enabled"}
          </span>
          <span className="rounded border border-gold/40 px-2.5 py-1 text-gold">
            realtime voice · webrtc
          </span>
        </div>
      </PageHeader>

      <Section>
        {mounted ? (
          <Suspense
            fallback={
              <Panel>
                <p className="font-mono text-xs text-muted-foreground">
                  Opening the ministry…
                </p>
              </Panel>
            }
          >
            <MinisterVoice online={online} />
          </Suspense>
        ) : (
          <Panel>
            <p className="font-mono text-xs text-muted-foreground">Opening the ministry…</p>
          </Panel>
        )}
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Charter-level constraints"
          title="Four things this agent cannot do"
          description="A system architecture agent with unbounded power is the exact failure mode Article V exists to prevent. The Platform steward is built so that its limits are structural, not promised."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {DOCTRINE.map((item) => (
            <Panel key={item.title} interactive>
              <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </Panel>
          ))}
        </div>
      </Section>
    </>
  );
}
