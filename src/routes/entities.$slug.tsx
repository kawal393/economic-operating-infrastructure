import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader, Panel, Section } from "@/components/primitives";
import { FieldRow, HonestyNote } from "@/components/seal-ui";
import { useAuth } from "@/hooks/useAuth";
import { attest, getEntityProfile } from "@/lib/entities.functions";

export const Route = createFileRoute("/entities/$slug")({
  loader: async ({ params }) => {
    const profile = await getEntityProfile({ data: { slug: params.slug } });
    if (!profile) throw notFound();
    return profile;
  },
  head: ({ loaderData }) => {
    const name = loaderData?.entity.name ?? "Entity";
    const status = loaderData?.entity.seal_status === "sealed" ? "sealed" : "unsealed";
    return {
      meta: [
        { title: `${name} — ${status} on the public registry | Sovereign AI Services` },
        {
          name: "description",
          content:
            loaderData?.entity.description ??
            `${name} is listed on the Sovereign AI Services registry with ${loaderData?.assets.length ?? 0} recorded assets.`,
        },
        { property: "og:title", content: `${name} — ${status}` },
        {
          property: "og:description",
          content: `Public registry record for ${name}, with verifiable receipts for every sealed asset.`,
        },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/entities/${loaderData?.entity.slug ?? ""}` }],
    };
  },
  errorComponent: () => (
    <Section>
      <p className="text-sm text-muted-foreground">This record could not be loaded.</p>
    </Section>
  ),
  notFoundComponent: () => (
    <Section>
      <p className="text-sm text-muted-foreground">No entity is listed under that name.</p>
    </Section>
  ),
  component: EntityPage,
});

function EntityPage() {
  const { entity, assets, attestations } = Route.useLoaderData();
  const { user } = useAuth();
  const write = useServerFn(attest);
  const [claim, setClaim] = useState("");
  const [counterTo, setCounterTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [local, setLocal] = useState<{ id: string; claim: string; counter: string | null }[]>([]);

  async function submit() {
    setBusy(true);
    try {
      const result = await write({ data: { entityId: entity.id, claim, counterTo } });
      if (!result.ok) {
        toast.error(result.reason);
        return;
      }
      setLocal((prev) => [...prev, { id: result.attestation.id, claim, counter: counterTo }]);
      setClaim("");
      setCounterTo(null);
      toast.success("Attestation recorded. It is permanent and answerable.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={entity.kind}
        title={entity.name}
        description={entity.description ?? "No description supplied by this entity."}
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <Panel>
              <p className="eyebrow">Assets on record</p>
              {assets.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No assets recorded. Nothing about this entity is currently provable here.
                </p>
              ) : (
                <div className="mt-3">
                  {assets.map((a) => (
                    <FieldRow
                      key={a.id}
                      label={`${a.asset_kind} · ${a.label}`}
                      tone={a.seal_status === "sealed" ? "success" : "warning"}
                      value={a.content_hash ?? "unsealed"}
                    />
                  ))}
                </div>
              )}
            </Panel>

            <Panel>
              <p className="eyebrow">Attestations</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Claims made about this entity by citizens. Nothing is ever removed; a disputed claim
                is answered with a counter-attestation shown beside it.
              </p>
              <div className="mt-4 space-y-4">
                {[...attestations, ...local.map((l) => ({
                  id: l.id,
                  claim: l.claim,
                  subject: null,
                  counter_attestation_id: l.counter,
                  created_at: new Date().toISOString(),
                }))].map((a) => (
                  <div
                    key={a.id}
                    className={`rounded-md border p-4 ${
                      a.counter_attestation_id ? "ml-6 border-border/60 bg-secondary/30" : "border-border"
                    }`}
                  >
                    <p className="text-sm text-foreground">{a.claim}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {a.counter_attestation_id ? "counter-attestation" : "attestation"}
                      </span>
                      {user ? (
                        <button
                          type="button"
                          onClick={() => setCounterTo(a.id)}
                          className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold"
                        >
                          Rebut
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
                {attestations.length + local.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing has been claimed yet.</p>
                ) : null}
              </div>

              {user ? (
                <div className="mt-6 border-t border-border/60 pt-4">
                  {counterTo ? (
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
                      Answering an existing claim ·{" "}
                      <button type="button" onClick={() => setCounterTo(null)} className="underline">
                        cancel
                      </button>
                    </p>
                  ) : null}
                  <textarea
                    value={claim}
                    rows={3}
                    maxLength={1200}
                    onChange={(e) => setClaim(e.target.value)}
                    placeholder="State the claim plainly and factually."
                    className="input-field"
                  />
                  <button
                    type="button"
                    disabled={busy || claim.trim().length < 4}
                    onClick={submit}
                    className="mt-3 rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-gold disabled:opacity-40"
                  >
                    {busy ? "Recording…" : counterTo ? "Publish rebuttal" : "Publish attestation"}
                  </button>
                </div>
              ) : (
                <p className="mt-6 text-sm text-muted-foreground">
                  <Link to="/auth" className="text-gold underline">
                    Sign in
                  </Link>{" "}
                  to attest or to rebut a claim made here.
                </p>
              )}
            </Panel>

            <HonestyNote>
              Integrity proven. Truth not verified. Seals show that an asset has not changed since it
              was recorded. Attestations are the opinions of the citizens who signed them.
            </HonestyNote>
          </div>

          <aside className="space-y-6">
            <Panel>
              <p className="eyebrow">Record</p>
              <div className="mt-3">
                <FieldRow label="Kind" value={entity.kind} />
                <FieldRow label="Domain" value={entity.domain ?? "—"} />
                <FieldRow
                  label="Domain proof"
                  tone={entity.domain_verified_at ? "success" : "warning"}
                  value={entity.domain_verified_at ? "verified" : "unproved"}
                />
                <FieldRow
                  label="Seal"
                  tone={entity.seal_status === "sealed" ? "success" : "warning"}
                  value={entity.receipt_id ?? "unsealed"}
                />
                <FieldRow label="Listed" value={new Date(entity.created_at).toISOString()} />
              </div>
              {entity.receipt_id ? (
                <Link
                  to="/r/$receiptId"
                  params={{ receiptId: entity.receipt_id }}
                  className="mt-4 inline-block rounded-md border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
                >
                  View the proof
                </Link>
              ) : null}
            </Panel>

            <Panel>
              <p className="eyebrow">Is this you?</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Prove control of the domain and this listing becomes yours to seal and maintain.
              </p>
              <Link
                to="/onboard"
                className="mt-4 inline-block rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-gold"
              >
                Claim this listing
              </Link>
            </Panel>
          </aside>
        </div>
      </Section>
    </>
  );
}
