import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { FieldRow, HonestyNote } from "@/components/seal-ui";
import { CopyBlock } from "@/components/copy-block";
import { downloadText, generateKeypair, toHex } from "@/lib/apex-psi";
import { didKeyFromEd25519Hex } from "@/lib/interop";
import {
  CAPABILITIES,
  generateAgentKeypair,
  issuePassport,
  toBearerToken,
  verifyPassport,
  type Passport,
  type PassportCheck,
} from "@/lib/passport";

export const Route = createFileRoute("/credentials")({
  head: () => ({
    meta: [
      { title: "Agent credentials — Bounded Delegation | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Issue UCAN-style capability passports so autonomous agents can act for a member within strict bounds — signed in your browser, verifiable offline, revocable on the ledger.",
      },
      { property: "og:title", content: "Agent credentials — Bounded Delegation" },
      {
        property: "og:description",
        content:
          "Delegate named powers to an AI agent with an expiry, an invocation cap and an Ed25519 signature the platform never holds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/credentials" }],
  }),
  component: PassportPage,
});

type Identity = { secretKey: Uint8Array; publicKey: string };

function PassportPage() {
  const [member, setCitizen] = useState<Identity | null>(null);
  const [agent, setAgent] = useState<Identity | null>(null);
  const [selected, setSelected] = useState<string[]>(["verify", "read-ledger"]);
  const [ttlHours, setTtlHours] = useState(24);
  const [maxInvocations, setMaxInvocations] = useState<number | "">(100);
  const [delegable, setDelegable] = useState(false);
  const [passport, setPassport] = useState<Passport | null>(null);

  const [checkRaw, setCheckRaw] = useState("");
  const [checkKey, setCheckKey] = useState("");
  const [check, setCheck] = useState<PassportCheck | null>(null);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const issue = async () => {
    if (!member || !agent) {
      toast.error("Generate both a member key and an agent key first.");
      return;
    }
    try {
      const issued = await issuePassport({
        issuerSecretKey: member.secretKey,
        issuerPublicKey: member.publicKey,
        agentPublicKey: agent.publicKey,
        capabilityIds: selected,
        ttlHours,
        maxInvocations: maxInvocations === "" ? null : Number(maxInvocations),
        delegable,
      });
      setPassport(issued);
      toast.success("Passport issued and signed locally.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not issue the passport.");
    }
  };

  const runCheck = async () => {
    try {
      const parsed = JSON.parse(checkRaw) as Passport;
      const key = checkKey.trim();
      if (!/^[0-9a-f]{64}$/i.test(key)) {
        toast.error("Paste the issuer's 64-character hex public key.");
        return;
      }
      setCheck(await verifyPassport(parsed, key.toLowerCase()));
    } catch {
      toast.error("That is not a passport document.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Article III · Delegated Authority"
        title="Agent Passports"
        description="An autonomous agent should never hold a member's key. It should hold a signed, expiring, itemised licence to do a few specific things. Passports are issued in your browser, verify against your public key alone, and expire whether or not this nation still exists."
      />

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <SectionHeading eyebrow="Step 1" title="Identities" description="Two keys, never mixed. The member signs; the agent is merely named." />
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    const kp = await generateKeypair();
                    setCitizen(kp);
                    toast.success("Member key generated in this browser.");
                  }}
                  className="rounded-md border border-gold/40 bg-gold/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold/20"
                >
                  Generate member key
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const kp = await generateAgentKeypair();
                    setAgent(kp);
                    toast.success("Agent key generated.");
                  }}
                  className="rounded-md border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Generate agent key
                </button>
              </div>
              {member ? (
                <div>
                  <FieldRow label="Member did:key" value={didKeyFromEd25519Hex(member.publicKey)} />
                  <FieldRow label="Member public key" value={member.publicKey} />
                </div>
              ) : null}
              {agent ? (
                <div>
                  <FieldRow label="Agent did:key" value={didKeyFromEd25519Hex(agent.publicKey)} />
                  <FieldRow label="Agent secret (keep it on the agent)" value={toHex(agent.secretKey)} />
                </div>
              ) : null}
            </div>
          </Panel>

          <Panel>
            <SectionHeading eyebrow="Step 2" title="Powers and bounds" description="Only what is ticked can be exercised. Everything else is refused by construction." />
            <div className="mt-6 space-y-2">
              {CAPABILITIES.map((cap) => (
                <label
                  key={cap.id}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-border/60 p-3 transition-colors hover:border-gold/40"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(cap.id)}
                    onChange={() => toggle(cap.id)}
                    className="mt-1 accent-[var(--gold)]"
                  />
                  <span>
                    <span className="text-sm font-medium text-foreground">{cap.label}</span>
                    {cap.mutating ? (
                      <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-warning">
                        mutating
                      </span>
                    ) : null}
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      {cap.detail}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Valid for (hours)
                </span>
                <input
                  type="number"
                  min={1}
                  max={8760}
                  value={ttlHours}
                  onChange={(e) => setTtlHours(Math.max(1, Number(e.target.value) || 1))}
                  className="mt-2 w-full rounded-md border border-border bg-secondary/40 px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-gold/50"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Max invocations
                </span>
                <input
                  type="number"
                  min={1}
                  value={maxInvocations}
                  onChange={(e) =>
                    setMaxInvocations(e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))
                  }
                  className="mt-2 w-full rounded-md border border-border bg-secondary/40 px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-gold/50"
                />
              </label>
            </div>

            <label className="mt-4 flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={delegable}
                onChange={(e) => setDelegable(e.target.checked)}
                className="accent-[var(--gold)]"
              />
              <span className="text-sm text-muted-foreground">
                Allow the agent to sub-delegate a subset of these powers
              </span>
            </label>

            <button
              type="button"
              onClick={issue}
              className="mt-6 w-full rounded-md border border-gold/40 bg-gold/10 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold/20"
            >
              Issue passport
            </button>
          </Panel>
        </div>

        {passport ? (
          <Panel className="mt-6">
            <SectionHeading eyebrow="Issued" title={passport.passport_id} />
            <div className="mt-6">
              <FieldRow label="Audience" value={passport.audience} />
              <FieldRow label="Capabilities" value={passport.capabilities.map((c) => c.action).join(", ")} />
              <FieldRow label="Not before" value={passport.not_before} />
              <FieldRow label="Expires" value={passport.expires_at} tone="warning" />
            </div>
            <CopyBlock
              className="mt-6"
              label={`${passport.passport_id}.passport.json`}
              value={JSON.stringify(passport, null, 2)}
            />
            <CopyBlock
              className="mt-4"
              label="Bearer token (Authorization header)"
              value={`Authorization: Passport ${toBearerToken(passport)}`}
            />
            <button
              type="button"
              onClick={() =>
                downloadText(`${passport.passport_id}.passport.json`, JSON.stringify(passport, null, 2))
              }
              className="mt-4 rounded-md border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Download passport
            </button>
          </Panel>
        ) : null}

        <HonestyNote>
          A passport is a licence, not a leash. It proves the member authorised those powers; it
          cannot force the agent to behave. Bound the window, cap the invocations, and revoke by
          sealing a revocation notice to the ledger.
        </HonestyNote>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Verification"
          title="Check a passport"
          description="Anyone holding the issuer's public key can validate a passport offline. No account, no call to us."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel>
            <textarea
              value={checkRaw}
              onChange={(e) => setCheckRaw(e.target.value)}
              rows={10}
              placeholder="Paste passport JSON"
              className="w-full rounded-md border border-border bg-secondary/40 p-3 font-mono text-[11px] text-foreground outline-none focus:border-gold/50"
            />
            <input
              value={checkKey}
              onChange={(e) => setCheckKey(e.target.value)}
              placeholder="Issuer public key (64 hex characters)"
              className="mt-4 w-full rounded-md border border-border bg-secondary/40 px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-gold/50"
            />
            <button
              type="button"
              onClick={runCheck}
              className="mt-4 rounded-md border border-gold/40 bg-gold/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold/20"
            >
              Verify passport
            </button>
          </Panel>
          <Panel>
            {check ? (
              <div>
                <FieldRow
                  label="Verdict"
                  value={check.valid ? "VALID" : "REFUSED"}
                  tone={check.valid ? "success" : "danger"}
                />
                <FieldRow label="Signature" value={check.signatureValid ? "verifies" : "fails"} />
                <FieldRow label="Document integrity" value={check.idMatches ? "unedited" : "edited"} />
                <FieldRow label="Time window" value={check.withinWindow ? "current" : "outside"} />
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{check.reason}</p>
              </div>
            ) : (
              <p className="font-mono text-xs text-muted-foreground">
                No passport checked yet.
              </p>
            )}
          </Panel>
        </div>
      </Section>
    </>
  );
}
