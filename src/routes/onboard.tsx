import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader, Panel, Section } from "@/components/primitives";
import { DropZone, FieldRow, HonestyNote, TabSwitch } from "@/components/seal-ui";
import { useAuth } from "@/hooks/useAuth";
import {
  addAsset,
  addEntity,
  getVerificationToken,
  sealEntity,
  verifyDomain,
} from "@/lib/entities.functions";
import { publishReceipt } from "@/lib/ledger.functions";
import { ASSET_KINDS, ENTITY_KINDS, type AssetKind, type Entity, type EntityKind } from "@/lib/entity-types";
import {
  buildReceipt,
  canonicalise,
  digestFile,
  digestText,
  downloadText,
  generateKeypair,
} from "@/lib/apex-psi";

export const Route = createFileRoute("/onboard")({
  head: () => ({
    meta: [
      { title: "Register a Company, AI or Asset | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Add your company, your AI system, yourself or your websites and assets to the public registry. Prove control of your domain, seal each asset, and publish the proof to the open ledger.",
      },
      { property: "og:title", content: "Register your entity on the open registry" },
      {
        property: "og:description",
        content:
          "Companies, AIs and humans list their websites and assets, prove domain control and seal each one to the public chain.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/onboard" }],
  }),
  component: OnboardPage,
});

type Step = "entity" | "claim" | "assets";

function OnboardPage() {
  const { user, loading } = useAuth();
  const create = useServerFn(addEntity);
  const token = useServerFn(getVerificationToken);
  const verify = useServerFn(verifyDomain);
  const seal = useServerFn(sealEntity);
  const attach = useServerFn(addAsset);
  const publish = useServerFn(publishReceipt);

  const [step, setStep] = useState<Step>("entity");
  const [entity, setEntity] = useState<Entity | null>(null);
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [kind, setKind] = useState<EntityKind>("company");
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");

  const [assetLabel, setAssetLabel] = useState("");
  const [assetKind, setAssetKind] = useState<AssetKind>("website");
  const [assetUrl, setAssetUrl] = useState("");
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [assetText, setAssetText] = useState("");
  const [assets, setAssets] = useState<{ label: string; hash: string | null; receipt: string | null }[]>([]);

  async function onCreate() {
    setBusy(true);
    try {
      const result = await create({
        data: {
          name,
          kind,
          domain: domain.trim() || null,
          description: description.trim() || null,
          claimAsMine: true,
        },
      });
      if (!result.ok) {
        toast.error(result.reason);
        return;
      }
      setEntity(result.entity);
      setStep(result.entity.domain ? "claim" : "assets");
      toast.success(`${result.entity.name} is listed in the public registry.`);
      const t = await token({ data: { entityId: result.entity.id } });
      if (t.ok) setClaimToken(t.token);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onVerify() {
    if (!entity) return;
    setBusy(true);
    try {
      const result = await verify({ data: { entityId: entity.id } });
      if (!result.ok) {
        toast.error(result.reason);
        return;
      }
      setEntity(result.entity);
      toast.success("Domain control proved. The listing is now yours.");
      setStep("assets");
    } finally {
      setBusy(false);
    }
  }

  async function onSealListing() {
    if (!entity) return;
    setBusy(true);
    try {
      const record = canonicalise({
        kind: entity.kind,
        name: entity.name,
        domain: entity.domain,
        description: entity.description,
        slug: entity.slug,
      });
      const digest = await digestText(record);
      const keypair = await generateKeypair();
      const receipt = await buildReceipt({
        digest,
        predicates: {
          source: "text",
          name: `${entity.slug}.listing.json`,
          size: record.length,
          mime: "application/json",
        },
        keypair,
      });
      const published = await publish({ data: { receipt: JSON.stringify(receipt) } });
      if (!published.ok) {
        toast.error(published.reason);
        return;
      }
      const result = await seal({
        data: { entityId: entity.id, receiptId: receipt.receipt_id, contentHash: digest },
      });
      if (!result.ok) {
        toast.error(result.reason);
        return;
      }
      setEntity(result.entity);
      downloadText(`${entity.slug}.praman`, JSON.stringify(receipt, null, 2));
      toast.success("Listing sealed and appended to the public chain.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sealing failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onAddAsset() {
    if (!entity) return;
    setBusy(true);
    try {
      let hash: string | null = null;
      if (assetFile) hash = await digestFile(assetFile);
      else if (assetText.trim()) hash = await digestText(assetText);

      let receiptId: string | null = null;
      if (hash) {
        const keypair = await generateKeypair();
        const receipt = await buildReceipt({
          digest: hash,
          predicates: {
            source: assetFile ? "file" : "text",
            name: assetFile?.name ?? assetLabel,
            size: assetFile?.size ?? assetText.length,
            mime: assetFile?.type || "text/plain",
          },
          keypair,
        });
        const published = await publish({ data: { receipt: JSON.stringify(receipt) } });
        if (published.ok) {
          receiptId = receipt.receipt_id;
          downloadText(`${receipt.receipt_id}.praman`, JSON.stringify(receipt, null, 2));
        }
      }

      const result = await attach({
        data: {
          entityId: entity.id,
          label: assetLabel,
          assetKind,
          url: assetUrl.trim() || null,
          contentHash: hash,
          receiptId,
        },
      });
      if (!result.ok) {
        toast.error(result.reason);
        return;
      }
      setAssets((prev) => [{ label: assetLabel, hash, receipt: receiptId }, ...prev]);
      setAssetLabel("");
      setAssetUrl("");
      setAssetFile(null);
      setAssetText("");
      toast.success(hash ? "Asset added and sealed." : "Asset added (unsealed).");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add the asset.");
    } finally {
      setBusy(false);
    }
  }

  if (!loading && !user) {
    return (
      <>
        <PageHeader
          eyebrow="Onboarding"
          title="Bring your company, your AI or yourself onto the record."
          description="Registration is bound to a real account so the registry cannot be filled with ghosts."
        />
        <Section>
          <Panel className="max-w-xl p-8">
            <p className="text-sm text-muted-foreground">
              Sign in, then register as a member, and this console will open.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/auth" className="rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-gold">
                Sign in
              </Link>
              <Link to="/registry-join" className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground">
                Registry membership
              </Link>
            </div>
          </Panel>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Onboarding"
        title="Register an entity. Prove the domain. Seal every asset."
        description="Companies, AI systems, institutions and individuals enter the registry the same way: a listing, a domain proof, and a receipt per asset that verifies without this website."
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Panel>
              <TabSwitch
                options={[
                  { value: "entity", label: "1 · Entity" },
                  { value: "claim", label: "2 · Domain" },
                  { value: "assets", label: "3 · Assets" },
                ]}
                value={step}
                onChange={(v) => setStep(v)}
              />

              {step === "entity" ? (
                <div className="mt-6 space-y-4">
                  <Field label="Name">
                    <input
                      value={name}
                      maxLength={120}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Acme Corporation / Atlas-7 / Jane Doe"
                      className="input-field"
                    />
                  </Field>
                  <Field label="Kind">
                    <div className="flex flex-wrap gap-2">
                      {ENTITY_KINDS.map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setKind(k)}
                          className={`rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                            kind === k
                              ? "border-gold/50 bg-gold/10 text-gold"
                              : "border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Website domain (optional)">
                    <input
                      value={domain}
                      maxLength={180}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="acme.com"
                      className="input-field"
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      value={description}
                      maxLength={1200}
                      rows={4}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What this entity is, and what it publishes."
                      className="input-field"
                    />
                  </Field>
                  <button
                    type="button"
                    disabled={busy || name.trim().length < 2}
                    onClick={onCreate}
                    className="rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/20 disabled:opacity-40"
                  >
                    {busy ? "Writing…" : "Create listing"}
                  </button>
                </div>
              ) : null}

              {step === "claim" ? (
                <div className="mt-6 space-y-4">
                  {!entity ? (
                    <p className="text-sm text-muted-foreground">Create the listing first.</p>
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Publish this file at{" "}
                        <span className="font-mono text-gold">
                          https://{entity.domain ?? "your-domain"}/.well-known/sovereign-ai.json
                        </span>{" "}
                        then verify. Domain control is the only thing that grants ownership of a listing.
                      </p>
                      <pre className="overflow-x-auto rounded-md border border-border bg-secondary/40 p-4 font-mono text-xs text-foreground">
{`{
  "entity": "${entity.slug}",
  "token": "${claimToken ?? "…"}",
  "issuer": "sovereign-ai.services"
}`}
                      </pre>
                      <button
                        type="button"
                        disabled={busy || !entity.domain}
                        onClick={onVerify}
                        className="rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-gold disabled:opacity-40"
                      >
                        {busy ? "Checking…" : "Verify domain"}
                      </button>
                    </>
                  )}
                </div>
              ) : null}

              {step === "assets" ? (
                <div className="mt-6 space-y-4">
                  {!entity ? (
                    <p className="text-sm text-muted-foreground">Create the listing first.</p>
                  ) : (
                    <>
                      <Field label="Asset label">
                        <input
                          value={assetLabel}
                          maxLength={160}
                          onChange={(e) => setAssetLabel(e.target.value)}
                          placeholder="Model card v3 / Terms of service / /api/inference"
                          className="input-field"
                        />
                      </Field>
                      <Field label="Asset kind">
                        <div className="flex flex-wrap gap-2">
                          {ASSET_KINDS.map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => setAssetKind(k)}
                              className={`rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                                assetKind === k
                                  ? "border-gold/50 bg-gold/10 text-gold"
                                  : "border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {k}
                            </button>
                          ))}
                        </div>
                      </Field>
                      <Field label="URL (optional)">
                        <input
                          value={assetUrl}
                          maxLength={400}
                          onChange={(e) => setAssetUrl(e.target.value)}
                          placeholder="https://acme.com/model-card"
                          className="input-field"
                        />
                      </Field>
                      <DropZone
                        label="Drop the asset to seal it"
                        hint="Hashed in your browser. The file itself is never uploaded — only the digest and signature travel."
                        file={assetFile}
                        onFile={setAssetFile}
                      />
                      {!assetFile ? (
                        <Field label="…or paste text to seal">
                          <textarea
                            value={assetText}
                            rows={4}
                            onChange={(e) => setAssetText(e.target.value)}
                            className="input-field"
                            placeholder="Paste the policy, model card or statement."
                          />
                        </Field>
                      ) : null}
                      <button
                        type="button"
                        disabled={busy || assetLabel.trim().length < 2}
                        onClick={onAddAsset}
                        className="rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-gold disabled:opacity-40"
                      >
                        {busy ? "Sealing…" : "Add asset"}
                      </button>

                      {assets.length ? (
                        <div className="mt-4 border-t border-border/60 pt-4">
                          {assets.map((a) => (
                            <FieldRow
                              key={`${a.label}-${a.hash}`}
                              label={a.label}
                              tone={a.receipt ? "success" : "warning"}
                              value={a.receipt ? `${a.receipt} · sealed` : "recorded, unsealed"}
                            />
                          ))}
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}
            </Panel>

            <HonestyNote>
              Integrity proven. Truth not verified. A seal proves an asset has not changed since it
              was recorded — it does not certify that the asset is accurate, lawful or safe.
            </HonestyNote>
          </div>

          <aside className="space-y-6">
            <Panel>
              <p className="eyebrow">Listing</p>
              {entity ? (
                <div className="mt-3">
                  <FieldRow label="Name" value={entity.name} mono={false} />
                  <FieldRow label="Slug" value={`/entities/${entity.slug}`} />
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
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={onSealListing}
                      className="rounded-md border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground disabled:opacity-40"
                    >
                      Seal listing
                    </button>
                    <Link
                      to="/entities/$slug"
                      params={{ slug: entity.slug }}
                      className="rounded-md border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
                    >
                      Public page
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Nothing yet. The listing appears here the moment it is written to the registry.
                </p>
              )}
            </Panel>

            <Panel>
              <p className="eyebrow">Why this matters</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Every listing is public and permanent. Absence is visible too: an entity with no
                receipts appears in the registry as unsealed, and anyone may add a listing for an
                entity that has not shown up yet. Ownership is only ever transferred by proving
                control of the domain.
              </p>
            </Panel>
          </aside>
        </div>
      </Section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
