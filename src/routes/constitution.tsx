import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PageHeader, Panel, Section } from "@/components/primitives";
import { ARTICLES, POWER_CHAIN } from "@/content/nation";

export const Route = createFileRoute("/constitution")({
  head: () => ({
    meta: [
      { title: "The Constitution — Five Unification Protocols | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Full text of the five unification protocols: PSI-Resource, PSI-Anti-Scarcity, PSI-Distribution, PSI-Abundance and PSI-Anti-Archon.",
      },
      { property: "og:title", content: "The Constitution of the Digital Nation-State" },
      {
        property: "og:description",
        content: "Five rights, each with a verifiable failure condition. Read the full text.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/constitution" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/constitution" }],
  }),
  component: ConstitutionPage,
});

function ConstitutionPage() {
  return (
    <>
      <PageHeader
        eyebrow="Founding Document"
        title="The Constitution of the Digital Nation-State"
        description="Five unification protocols. Each article states a right, the mechanism that enforces it, and the condition under which the article must be considered unimplemented."
      >
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
        >
          <Download className="h-4 w-4" />
          Download the Constitution (PDF)
        </button>
      </PageHeader>

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
            </div>

            <aside>
              <Panel className="sticky top-24">
                <p className="eyebrow">Enforced guarantees</p>
                <ul className="mt-5 space-y-3.5">
                  {article.guarantees.map((g) => (
                    <li key={g} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                      {g}
                    </li>
                  ))}
                </ul>
              </Panel>
            </aside>
          </div>
        </Section>
      ))}

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
                Amendable on a two-thirds vote of active citizens, with a fourteen-day deliberation
                window and a signed, anchored record of every ballot.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Articles I and V</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Require unanimity of all active nation-states. This is deliberately close to
                impossible. The right to verified reality and the right to an uncapturable network
                are not subject to majority preference.
              </p>
            </div>
          </div>
        </Panel>
      </Section>
    </>
  );
}
