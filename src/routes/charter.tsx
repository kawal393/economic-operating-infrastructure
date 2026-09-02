import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import * as ed from "@noble/ed25519";
import { CheckCircle2, Download, FileJson, PenLine, XCircle } from "lucide-react";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { ARTICLE3_STATUS, CUSTODY_FENCE } from "@/content/legal";
import { ARTICLES, POWER_CHAIN } from "@/content/nation";
import {
  AMENDMENT_THRESHOLDS,
  CHARTER_CURRENT_VERSION,
  CHARTER_DISPLAY_NAME,
  CHARTER_DISPLAY_TAGLINE,
  articleDigest,
  articleTextDigest,
  articlesForVersion,
  canonicalArticles,
} from "@/lib/constitution";
import {
  getConformance,
  getConstitutionState,
  ratifyConstitution,
} from "@/lib/constitution.functions";
import { didKeyFromEd25519Hex } from "@/lib/interop";
import { toHex } from "@/lib/apex-psi";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/charter")({
  head: () => ({
    meta: [
      { title: "The Protocol Charter of the AI Era | Sovereign AI Services" },
      {
        name: "description",
        content:
          "A Charter is only written once — but it can be updated forever. Five unification articles, a sealed version history, public ratification and live conformance checks.",
      },
      { property: "og:title", content: "The Protocol Charter of the AI Era" },
      {
        property: "og:description",
        content:
          "A Charter is only written once — but it can be updated forever. Every version sealed, anchored and independently verifiable.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/charter" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/charter" }],
  }),
  component: ConstitutionPage,
});

/**
 * Implementation status, rendered BESIDE the sealed charter text.
 *
 * Each Article's digest covers its body, guarantees, name, numeral, right, slug and
 * thesis, so a disclaimer cannot be inserted into an Article without changing a
 * sealed document that members have already signed. What is built and what is only
 * specified is therefore stated here and in the conformance checks below.
 */
const IMPLEMENTATION_STATUS = [
  {
    article: "I",
    name: "PSI-Resource",
    state: "Live",
    detail:
      "RFC 8785 canonicalisation, SHA-256 digests, permissionless verification with no account or key, and a hash-linked public ledger readable through the API. Live, and free at the point of use.",
  },
  {
    article: "II",
    name: "PSI-Anti-Scarcity",
    state: "Partly live",
    detail:
      "Sealing any claim into a dated, anchored, permanently addressable record is live and permissionless, which is the permanence this Article describes. A dedicated counter-attestation pairing — an attestation against a withheld resource, with a symmetric right of rebuttal — is not built; attestations exist only inside entity records.",
  },
  {
    article: "III",
    name: "PSI-Distribution",
    state: "Not implemented",
    detail:
      ARTICLE3_STATUS +
      " By the Article's own test — an operator who can choose not to route has not implemented Article III — this platform has not implemented it.",
  },
  {
    article: "IV",
    name: "PSI-Abundance",
    state: "Not implemented",
    detail:
      "No sufficiency floor can be declared, signed or anchored: there is no declaration machinery, and no floor has ever been declared. Article IV supplies the inputs to Article III routing, so it is unimplemented for the same reason.",
  },
  {
    article: "V",
    name: "PSI-Non-Capture",
    state: "Partly live",
    detail:
      "Member receipts are signed with the member's own key and verify offline with no dependency on this platform; the ledger is publicly readable and mirrorable through the API; a signed transparency-log checkpoint is published. What is not yet true: the platform's own seal-of-state key derives from a single secret seed in one environment — one head. Until it is sharded under a published ceremony, our checkpoints and inclusion proofs rest on one secret. That is printed as a failed check below rather than buried.",
  },
];

function ConstitutionPage() {
  const stateFn = useServerFn(getConstitutionState);
  const state = useQuery({ queryKey: ["Charter-state"], queryFn: () => stateFn() });
  const version = state.data?.current?.version ?? 1;
  const articles = canonicalArticles(articlesForVersion(version));

  return (
    <>
      <PageHeader
        eyebrow={`Founding Document · Version ${version}`}
        title={CHARTER_DISPLAY_NAME}
        description={`${CHARTER_DISPLAY_TAGLINE} Five unification protocols. Each article states a right, the mechanism that enforces it, and the condition under which the article must be considered unimplemented.`}
      >
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
          >
            <Download className="h-4 w-4" />
            Download the Protocol Charter (PDF)
          </button>
          <a
            href="/charter.json"
            className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
          >
            <FileJson className="h-4 w-4" />
            Machine-readable (signed)
          </a>
          <Link
            to="/amendments"
            className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
          >
            <PenLine className="h-4 w-4" />
            Amendments
          </Link>
        </div>
      </PageHeader>

      <VersionLedger />

      <VersionComparison />

      <Section className="py-14">
        <nav className="flex flex-wrap gap-2">
          {ARTICLES.map((a) => (
            <a
              key={a.id}
              href={`#${a.slug}`}
              className="rounded-md border border-border bg-secondary/40 px-3.5 py-2 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
            >
              Art. {a.numeral} · {a.name}
            </a>
          ))}
        </nav>

        <Panel className="mt-8 border-gold/40 bg-gold/5 p-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
            Implementation status — beside the sealed text, never inside it
          </p>
          <p className="mt-3.5 text-sm leading-relaxed text-foreground">
            The Charter below is digest-sealed: this page recomputes the hash of the live text and
            prints whether it still matches, and members ratify by signing that digest. Not one word
            of an Article can therefore be edited to carry a disclaimer without silently changing a
            sealed document. So the truth about what is built and what is only specified is stated
            here, and again in the conformance checks at the foot of this page, which now report
            Articles III and IV as failures instead of substituting an easier claim for them.
          </p>
          <dl className="mt-6 space-y-5">
            {IMPLEMENTATION_STATUS.map((row) => (
              <div
                key={row.article}
                className="border-t border-border pt-4 first:border-t-0 first:pt-0"
              >
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold">
                  Article {row.article} · {row.name} — {row.state}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{row.detail}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
            {CUSTODY_FENCE}
          </p>
        </Panel>
      </Section>

      {ARTICLES.map((article, index) => (
        <Section
          key={article.id}
          id={article.slug}
          className={index % 2 === 1 ? "bg-surface/30 scroll-mt-20" : "scroll-mt-20"}
        >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-5xl font-semibold text-gold/30">
                  {article.numeral}
                </span>
                <div>
                  <p className="eyebrow">Article {article.numeral}</p>
                  <h2 className="mt-1.5 text-3xl font-semibold tracking-tight text-foreground">
                    {article.name}
                  </h2>
                </div>
              </div>

              <p className="mt-6 text-lg font-medium text-gold">{article.right}</p>
              <p className="mt-4 border-l-2 border-gold/30 pl-5 text-base italic leading-relaxed text-foreground/85">
                {article.thesis}
              </p>

              <div className="mt-8 space-y-5">
                {article.body.map((para, i) => (
                  <p key={i} className="text-base leading-relaxed text-muted-foreground">
                    <span className="mr-3 font-mono text-xs text-gold/60">
                      {article.numeral}.{i + 1}
                    </span>
                    {para}
                  </p>
                ))}
              </div>

              <p className="mt-8 break-all font-mono text-[11px] text-muted-foreground">
                article digest v{version} ·{" "}
                <span className="text-gold/70">{articleDigest(articles[index]!, version)}</span>
              </p>
            </div>

            <aside>
              <Panel className="sticky top-24">
                <p className="eyebrow">Stated guarantees</p>
                <ul className="mt-5 space-y-3.5">
                  {article.guarantees.map((g) => (
                    <li key={g} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                      {g}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 hairline" />
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Amendment · {AMENDMENT_THRESHOLDS[article.numeral]?.rule}
                </p>
              </Panel>
            </aside>
          </div>
        </Section>
      ))}

      <Conformance />

      <Ratify />

      <Section>
        <p className="eyebrow">The Power Chain</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          How the articles execute in sequence
        </h2>

        <ol className="mt-10 space-y-3">
          {POWER_CHAIN.map((node, i) => (
            <li key={node.step}>
              <Panel className="flex flex-wrap items-center gap-x-6 gap-y-2 p-5">
                <span className="font-mono text-sm text-gold/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-36 font-mono text-sm font-semibold uppercase tracking-[0.12em] text-gold">
                  {node.step}
                </span>
                <span className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {node.detail}
                </span>
                <span className="rounded border border-gold/25 bg-gold/10 px-2 py-0.5 font-mono text-[10px] text-gold">
                  Art. {node.article}
                </span>
              </Panel>
            </li>
          ))}
        </ol>

        <Panel className="mt-10 bg-gold/5">
          <p className="eyebrow">Amendment thresholds</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Articles II, III, IV</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Amendable on a two-thirds vote of ratifying members, with a fourteen-day
                deliberation window and a signed, anchored record of every ballot.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Articles I and V</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Require unanimity of all active workspaces. This is deliberately close to
                impossible. The right to verified reality and the right to a record that cannot be
                altered privately are not subject to majority preference.
              </p>
            </div>
          </div>
          <Link
            to="/amendments"
            className="mt-6 inline-flex rounded-md border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
          >
            Open the amendment floor
          </Link>
        </Panel>
      </Section>
    </>
  );
}

/**
 * Version comparison. Article V was amended in version 2; Articles I-IV were
 * carried forward byte-identical. The text digest below carries no version
 * number in its input, so an identical digest across two versions is proof the
 * words did not move; the versioned digest differs for every Article by
 * construction, because the version number is part of what it hashes.
 */
function VersionComparison() {
  const v1 = canonicalArticles(articlesForVersion(1));
  const v2 = canonicalArticles(articlesForVersion(2));

  return (
    <Section id="versions" className="py-14">
      <SectionHeading
        eyebrow="Amendment · v1 → v2"
        title="Article V was amended in public. The other four did not move."
        description="Version 1 (effective 6 August 2026) remains retrievable. Version 2 (effective 3 September 2026) replaced Article V and carried Articles I to IV forward unchanged. The digests below are recomputable from the published JSON."
      />

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Article
              </th>
              <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Text digest v1
              </th>
              <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Text digest v2
              </th>
              <th className="py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                State
              </th>
            </tr>
          </thead>
          <tbody>
            {v2.map((article, i) => {
              const d1 = articleTextDigest(v1[i]!);
              const d2 = articleTextDigest(article);
              const same = d1 === d2;
              return (
                <tr key={article.numeral} className="border-b border-border/60 align-top">
                  <td className="py-4 pr-4 font-mono text-sm text-gold">{article.numeral}</td>
                  <td className="py-4 pr-4 break-all font-mono text-[10px] text-muted-foreground">
                    {d1}
                  </td>
                  <td className="py-4 pr-4 break-all font-mono text-[10px] text-muted-foreground">
                    {d2}
                  </td>
                  <td className="py-4 font-mono text-[10px] uppercase tracking-[0.14em]">
                    <span className={same ? "text-muted-foreground" : "text-gold"}>
                      {same ? "unchanged" : "amended"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Panel className="p-6">
          <p className="eyebrow">Article V — version 1 (superseded)</p>
          <p className="mt-3 text-sm font-medium text-muted-foreground">{v1[4]!.name}</p>
          <div className="mt-4 space-y-3">
            {v1[4]!.body.map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground/80">
                {para}
              </p>
            ))}
          </div>
        </Panel>
        <Panel className="border-gold/30 p-6">
          <p className="eyebrow">Article V — version 2 (in force)</p>
          <p className="mt-3 text-sm font-medium text-gold">{v2[4]!.name}</p>
          <div className="mt-4 space-y-3">
            {v2[4]!.body.map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-foreground/85">
                {para}
              </p>
            ))}
          </div>
        </Panel>
      </div>

      <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted-foreground">
        The version 1 row stored in the ledger carries the digest recorded on 6 August 2026. Article
        text was edited after that row was written and before version scoping existed, so that
        stored digest no longer matches the version 1 text published here. The divergence is printed
        rather than corrected: overwriting a stored digest to make it agree with later text is the
        exact failure Article I exists to expose.
      </p>
    </Section>
  );
}

function VersionLedger() {
  const stateFn = useServerFn(getConstitutionState);
  const { data, isLoading } = useQuery({
    queryKey: ["Charter-state"],
    queryFn: () => stateFn(),
  });

  return (
    <Section className="bg-surface/30 py-14">
      <SectionHeading
        eyebrow="Living amendment ledger"
        title="Every version sealed. Every change provable."
        description="The text you are reading has a digest. That digest is stored, anchored and recomputable from the published JSON — so anyone can prove what the Charter said on any date, and detect a silent edit."
      />

      <div className="mt-10 grid gap-4 md:grid-cols-4">
        <Panel className="p-6">
          <p className="eyebrow">Current version</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-gold">
            v{data?.current?.version ?? 1}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Effective{" "}
            {data?.current ? new Date(data.current.effective_from).toLocaleDateString() : "—"}
          </p>
        </Panel>
        <Panel className="p-6">
          <p className="eyebrow">Ratifications</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-gold">
            {isLoading ? "…" : (data?.ratifications ?? 0).toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Signatures on this exact digest.</p>
        </Panel>
        <Panel className="p-6">
          <p className="eyebrow">Digest check</p>
          <p
            className={
              "mt-3 text-lg font-semibold tracking-tight " +
              (data?.digestMatches ? "text-gold" : "text-muted-foreground")
            }
          >
            {isLoading ? "…" : data?.digestMatches ? "Recomputed · match" : "Recompute pending"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Live text hashed and compared to the stored digest.
          </p>
        </Panel>
        <Panel className="p-6">
          <p className="eyebrow">Seal status</p>
          <p className="mt-3 text-lg font-semibold tracking-tight text-gold">
            {data?.current?.anchor_status ?? "pending"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Anchored beyond this platform's control.
          </p>
        </Panel>
      </div>

      <Panel className="mt-4 p-6">
        <p className="eyebrow">Current digest (SHA-256 over the canonical text)</p>
        <p className="mt-3 break-all font-mono text-xs text-gold/80">
          {data?.current?.digest ?? data?.liveDigest ?? "…"}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          This text, this hash — any divergence is visible.{" "}
          <Link to="/seal" className="text-gold underline-offset-4 hover:underline">
            Seal it into the ledger →
          </Link>
        </p>
      </Panel>

      <div className="mt-4 space-y-3">
        {(data?.versions ?? []).map((v) => (
          <Panel key={v.digest} className="flex flex-wrap items-center gap-x-6 gap-y-2 p-5">
            <span className="min-w-16 font-mono text-sm font-semibold text-gold">v{v.version}</span>
            <span className="flex-1 text-sm leading-relaxed text-muted-foreground">
              {v.summary}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {new Date(v.effective_from).toLocaleDateString()}
            </span>
            <span className="rounded border border-gold/25 bg-gold/10 px-2 py-0.5 font-mono text-[10px] text-gold">
              {v.digest.slice(0, 12)}…
            </span>
          </Panel>
        ))}
      </div>
    </Section>
  );
}

function Conformance() {
  const fn = useServerFn(getConformance);
  const { data, isLoading } = useQuery({ queryKey: ["conformance"], queryFn: () => fn() });

  return (
    <Section id="conformance">
      <SectionHeading
        eyebrow="Conformance"
        title="The platform runs its own failure conditions first"
        description="Each article is written as a test. These checks run against live infrastructure — not against a promise. Where a check fails, the failure and its evidence are printed rather than hidden: Article I applied to us first."
      />

      <div className="mt-10 space-y-3">
        {isLoading ? (
          <Panel className="p-6 text-sm text-muted-foreground">Running checks…</Panel>
        ) : (
          (data?.checks ?? []).map((c) => (
            <Panel key={`${c.article}-${c.claim}`} className="p-6">
              <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
                {c.status === "pass" ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                )}
                <div className="min-w-40">
                  <p className="font-mono text-sm font-semibold uppercase tracking-[0.12em] text-gold">
                    Art. {c.article} · {c.name}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed text-foreground/85">{c.claim}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Fails if: {c.failureCondition}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">{c.evidence}</p>
                </div>
              </div>
            </Panel>
          ))
        )}
      </div>

      {data ? (
        <p className="mt-6 font-mono text-xs text-muted-foreground">
          {data.passing}/{data.checks.length} passing · checked{" "}
          {new Date(data.checkedAt).toLocaleString()}
        </p>
      ) : null}
    </Section>
  );
}

function Ratify() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const stateFn = useServerFn(getConstitutionState);
  const ratifyFn = useServerFn(ratifyConstitution);
  const { data } = useQuery({ queryKey: ["Charter-state"], queryFn: () => stateFn() });

  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<"human" | "ai" | "organisation">("human");

  const sign = useMutation({
    mutationFn: async () => {
      const digest = data?.current?.digest ?? data?.liveDigest;
      if (!digest) throw new Error("No Charter version is available yet.");
      const secretKey = ed.utils.randomSecretKey();
      const publicKey = toHex(await ed.getPublicKeyAsync(secretKey));
      const signature = toHex(
        await ed.signAsync(new TextEncoder().encode(digest), secretKey),
      ).slice(0, 128);
      return ratifyFn({
        data: {
          versionDigest: digest,
          signerLabel: label,
          signerDid: didKeyFromEd25519Hex(publicKey),
          signature,
          signerKind: kind,
        },
      });
    },
    onSuccess: () => {
      toast.success("Ratified", {
        description: "Your signature is on the public record against this exact digest.",
      });
      setLabel("");
      queryClient.invalidateQueries({ queryKey: ["Charter-state"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Section className="bg-surface/30">
      <SectionHeading
        eyebrow="Ratification"
        title="Sign the version you actually read"
        description="A signature binds to a digest, not to a URL. If the text ever changes, your ratification stays attached to the version you consented to — and the new version starts from zero."
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <Panel className="p-7">
          <label className="grid gap-2">
            <span className="eyebrow">Public signer name</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ada Lovelace / Atlas-7 / Northwind Labs"
              className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-gold/50"
            />
          </label>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {(["human", "ai", "organisation"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={
                  "rounded-md border px-2 py-2 text-xs capitalize transition-colors " +
                  (kind === k
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-border text-muted-foreground hover:text-foreground")
                }
              >
                {k}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!user || label.trim().length < 2 || sign.isPending}
            onClick={() => sign.mutate()}
            className="mt-6 w-full rounded-md border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/20 disabled:opacity-40"
          >
            {sign.isPending
              ? "Signing…"
              : `Ratify v${data?.current?.version ?? CHARTER_CURRENT_VERSION}`}
          </button>
          {!user ? (
            <p className="mt-3 text-xs text-muted-foreground">
              <Link to="/auth" className="text-gold hover:underline">
                Sign in
              </Link>{" "}
              as a member to ratify. Registry membership is free.
            </p>
          ) : null}
        </Panel>

        <Panel className="p-7">
          <p className="eyebrow">Recent ratifications</p>
          {(data?.recentRatifications ?? []).length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No signatures on this version yet. Be the first name on the record.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {(data?.recentRatifications ?? []).map((r) => (
                <li
                  key={r.signer_did}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border/60 pb-3 last:border-0"
                >
                  <span className="text-sm text-foreground/85">{r.signer_label}</span>
                  <span className="rounded border border-gold/25 bg-gold/10 px-2 py-0.5 font-mono text-[10px] uppercase text-gold">
                    {r.signer_kind}
                  </span>
                  <span className="flex-1 truncate font-mono text-[11px] text-muted-foreground">
                    {r.signer_did}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </Section>
  );
}
