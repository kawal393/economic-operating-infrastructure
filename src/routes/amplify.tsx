import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Download, Newspaper, Rss, Shield, Sitemap as SitemapIcon } from "lucide-react";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { downloadText } from "@/lib/apex-psi";
import { getLedgerStats } from "@/lib/ledger.functions";

export const Route = createFileRoute("/amplify")({
  head: () => ({
    meta: [
      { title: "Propagation Console — Badges, Feeds & Press Kits | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Five automated propagation engines: proof permalinks, embeddable verification badges, the public registry, the syndicated Proof Feed and the press-kit generator. Every seal makes the network larger.",
      },
      { property: "og:title", content: "The Propagation Console" },
      {
        property: "og:description",
        content:
          "Badges, feeds, permalinks, registry pages and ready-to-publish articles — the self-expanding surface of the protocol.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/amplify" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/amplify" }],
  }),
  component: AmplifyPage,
});

const ORIGIN = "https://sovereign-ai.services";

const ENGINES = [
  {
    icon: Shield,
    title: "1 · Proof permalinks",
    body: "Every published seal mints a permanent, indexable page at /r/{receipt} with its own title, description and schema.org markup. Sealing is publishing.",
    to: "/ledger",
    cta: "See the chain",
  },
  {
    icon: Copy,
    title: "2 · Embeddable verification badge",
    body: "A live SVG served from /api/public/badge/{digest}. Every site that displays it renders our state and links back to us. Competitors must adopt it or explain its absence.",
    to: "/verify",
    cta: "Verify a receipt",
  },
  {
    icon: Newspaper,
    title: "3 · Public registry pages",
    body: "Each deployed nation-state gets an SEO landing page carrying its constitution, hash and founding proof. The directory grows without us writing a word.",
    to: "/registry",
    cta: "Open the registry",
  },
  {
    icon: Rss,
    title: "4 · The Proof Feed",
    body: "An RSS channel at /feed.xml republishing every seal. Aggregators, bots, newsletters and news desks can carry the chain automatically.",
    to: "/ledger",
    cta: "Ledger source",
  },
  {
    icon: SitemapIcon,
    title: "5 · Self-expanding sitemap",
    body: "/sitemap.xml regenerates from the live ledger and registry, so every new proof enters the crawl frontier within minutes of being written.",
    to: "/docs",
    cta: "Read the docs",
  },
] as const;

function pressRelease(input: {
  org: string;
  subject: string;
  receiptId: string;
  digest: string;
  date: string;
}) {
  return `FOR IMMEDIATE RELEASE

${input.org} publishes cryptographic proof of ${input.subject}

${input.date} — ${input.org} today sealed ${input.subject} under Apex PSI, the cryptographic provenance protocol operated in partnership with Sovereign AI Services, and appended the resulting receipt to a public, append-only notarisation chain.

The artefact is identified by the SHA-256 digest ${input.digest}. The corresponding receipt, ${input.receiptId}, is published at ${ORIGIN}/r/${input.receiptId} and can be independently verified by anyone — including with a zero-dependency offline verifier that requires no network connection, no account and no permission from ${input.org} or from Sovereign AI Services.

"Integrity is proven; truth is not," reads the standing honesty note attached to every receipt. The seal establishes that the sealed content has not changed since the moment it was recorded. It makes no claim about whether the content is correct.

The chain entry is committed to the Bitcoin blockchain through OpenTimestamps, placing the record beyond the reach of ${input.org}, of Sovereign AI Services, and of any future operator of either.

Verify independently:
· Receipt permalink — ${ORIGIN}/r/${input.receiptId}
· Online verifier — ${ORIGIN}/verify
· Offline verifier — ${ORIGIN}/offline-verifier.html
· Public ledger — ${ORIGIN}/ledger

About Sovereign AI Services
Sovereign AI Services operates the public notarisation infrastructure of the digital nation-state: free sealing and verification for humans, metered access for machines, and a constitution that denies its own operator the power to revoke, rewrite or reorder anything on the chain. Powered by Apex PSI.

###`;
}

function blogPost(input: { org: string; subject: string; receiptId: string; digest: string }) {
  return `# How ${input.org} made ${input.subject} independently verifiable

Most claims on the internet ask you to trust the party making them. This one does not.

${input.org} sealed ${input.subject} under **Apex PSI**, a cryptographic provenance protocol. Sealing produced a receipt — a small, signed JSON document that binds the exact bytes of the artefact to a moment in time:

- **Digest (SHA-256):** \`${input.digest}\`
- **Receipt:** [\`${input.receiptId}\`](${ORIGIN}/r/${input.receiptId})
- **Chain:** appended to a public, append-only ledger at [${ORIGIN}/ledger](${ORIGIN}/ledger)
- **Anchor:** committed to Bitcoin via OpenTimestamps

## Why this is different from a trust badge

A trust badge is a picture. A receipt is a computation. You can recompute the digest yourself, check the Ed25519 signature yourself, and confirm the chain position yourself — with the [offline verifier](${ORIGIN}/offline-verifier.html), which runs entirely in your browser with no network calls.

## What it proves — and what it does not

It proves **integrity**: these exact bytes existed at that time and have not changed since. It does not prove **truth**. No ledger can. Any system that claims otherwise is selling you a story.

## Verify it now

1. Download the receipt from [${ORIGIN}/r/${input.receiptId}](${ORIGIN}/r/${input.receiptId})
2. Open the [verifier](${ORIGIN}/verify)
3. Drop in the original artefact and the receipt

If the digests match, the claim stands on mathematics rather than on ${input.org}'s reputation.

---

*Sealed with [Apex PSI](${ORIGIN}) · Sovereign AI Services — the public notarisation infrastructure of the digital nation-state.*`;
}

function AmplifyPage() {
  const statsFn = useServerFn(getLedgerStats);
  const { data: stats } = useQuery({ queryKey: ["ledger-stats"], queryFn: () => statsFn({}) });

  const [org, setOrg] = useState("Your Organisation");
  const [subject, setSubject] = useState("its model release notes");
  const [receiptId, setReceiptId] = useState("psi_0000000000000000000000");
  const [digest, setDigest] = useState("0".repeat(64));
  const [format, setFormat] = useState<"press" | "blog">("press");

  const date = useMemo(
    () => new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    [],
  );

  const article =
    format === "press"
      ? pressRelease({ org, subject, receiptId, digest, date })
      : blogPost({ org, subject, receiptId, digest });

  const badgeHtml = `<a href="${ORIGIN}/r/${receiptId}">
  <img src="${ORIGIN}/api/public/badge/${digest}" alt="Sealed on the Sovereign AI public ledger" height="28" />
</a>`;

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Clipboard unavailable — select and copy manually.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Propagation"
        title="Five engines that make the network grow whether or not anyone markets it."
        description="Nothing here is advertising. Each engine converts ordinary usage into public surface area: a page, a badge, a listing, a feed item, an article. Cut one head off and the others keep writing."
      />

      <Section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ENGINES.map((engine) => {
            const Icon = engine.icon;
            return (
              <Panel key={engine.title} interactive className="flex flex-col p-6">
                <Icon className="h-5 w-5 text-gold" />
                <h2 className="mt-4 text-base font-semibold tracking-tight">{engine.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{engine.body}</p>
                <Link to={engine.to} className="mt-4 text-xs font-semibold text-gold">
                  {engine.cta} →
                </Link>
              </Panel>
            );
          })}
          <Panel className="flex flex-col justify-center p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Live surface</p>
            <p className="mt-3 text-3xl font-semibold text-gold">{stats?.entries ?? 0}</p>
            <p className="text-sm text-muted-foreground">
              indexable proof pages minted by usage alone
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <a href="/feed.xml" className="rounded-md border border-border px-2.5 py-1 text-muted-foreground">
                /feed.xml
              </a>
              <a href="/sitemap.xml" className="rounded-md border border-border px-2.5 py-1 text-muted-foreground">
                /sitemap.xml
              </a>
            </div>
          </Panel>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Generator"
          title="Press kit, written for you"
          description="Fill in the artefact and take away a wire-ready press release or a publishable blog post, both carrying live verification links."
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <Panel className="space-y-4 p-6">
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Organisation</span>
              <input
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/50"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">What was sealed</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/50"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Receipt ID</span>
              <input
                value={receiptId}
                onChange={(e) => setReceiptId(e.target.value.trim())}
                className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:border-gold/50"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Content digest (SHA-256)</span>
              <input
                value={digest}
                onChange={(e) => setDigest(e.target.value.trim().toLowerCase())}
                className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:border-gold/50"
              />
            </label>

            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Badge embed</p>
              <pre className="overflow-x-auto rounded-md border border-border bg-background p-3 text-[10px] leading-relaxed text-muted-foreground">
                {badgeHtml}
              </pre>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => copy(badgeHtml, "Badge embed")}
                  className="text-xs font-semibold text-gold"
                >
                  Copy embed
                </button>
                <img
                  src={`/api/public/badge/${/^[0-9a-f]{64}$/.test(digest) ? digest : "0".repeat(64)}`}
                  alt="Live verification badge preview"
                  height={28}
                />
              </div>
            </div>
          </Panel>

          <Panel className="p-6">
            <div className="mb-4 flex gap-2 rounded-md border border-border p-1">
              {(["press", "blog"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
                    format === f ? "bg-gold/15 text-gold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "press" ? "Press release" : "Blog post"}
                </button>
              ))}
            </div>
            <textarea
              readOnly
              value={article}
              rows={22}
              className="w-full rounded-md border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-muted-foreground outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copy(article, format === "press" ? "Press release" : "Blog post")}
                className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-xs font-semibold text-background"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadText(
                    format === "press" ? `${receiptId}-press-release.txt` : `${receiptId}-article.md`,
                    article,
                    "text/plain",
                  )
                }
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-xs text-muted-foreground"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>
          </Panel>
        </div>
      </Section>
    </>
  );
}
