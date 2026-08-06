import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader, Panel, Section } from "@/components/primitives";
import { getNationState } from "@/lib/citizen.functions";

export const Route = createFileRoute("/registry/$slug")({
  loader: async ({ params }) => {
    const nation = await getNationState({ data: { slug: params.slug } });
    if (!nation) throw notFound();
    return nation;
  },
  head: ({ loaderData, params }) => {
    const name = loaderData?.name ?? params.slug;
    const description = loaderData
      ? `${name} is a sovereign digital nation-state deployed on ${new Date(loaderData.created_at).toUTCString()}. Its constitution is sealed under SHA-256 ${loaderData.constitution_hash.slice(0, 24)}… and chained on the public Apex PSI ledger.`
      : `${name} on the registry of digital nation-states.`;
    return {
      meta: [
        { title: `${name} — Digital Nation-State | Sovereign AI Services` },
        { name: "description", content: description },
        { property: "og:title", content: `${name} — a sovereign digital nation-state` },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/registry/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/registry/${params.slug}` }],
      scripts: loaderData
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: loaderData.name,
                description: loaderData.tagline ?? description,
                foundingDate: loaderData.created_at,
                identifier: loaderData.constitution_hash,
                parentOrganization: { "@type": "Organization", name: "Sovereign AI Services" },
              }),
            },
          ]
        : [],
    };
  },
  component: NationPage,
  notFoundComponent: () => (
    <Section>
      <Panel className="p-8 text-sm text-muted-foreground">
        No nation-state holds that territory.{" "}
        <Link to="/registry" className="text-gold">
          Back to the registry →
        </Link>
      </Panel>
    </Section>
  ),
});

function NationPage() {
  const nation = Route.useLoaderData();

  return (
    <>
      <PageHeader
        eyebrow="Nation-state"
        title={nation.name}
        description={nation.tagline ?? "A sovereign digital nation-state on the Apex PSI protocol."}
      />

      <Section>
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Panel className="p-7">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Constitution</p>
            <pre className="mt-4 whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
              {nation.constitution_text ?? "Constitution text not published."}
            </pre>
          </Panel>

          <div className="space-y-4">
            <Panel className="p-6 text-sm">
              <dl className="space-y-3 text-xs">
                <div>
                  <dt className="uppercase tracking-widest text-muted-foreground">Constitution hash</dt>
                  <dd className="mt-1 break-all font-mono text-foreground">
                    sha256:{nation.constitution_hash}
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-widest text-muted-foreground">Territory</dt>
                  <dd className="mt-1 text-foreground">{nation.territory ?? "undeclared"}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-widest text-muted-foreground">Deployed</dt>
                  <dd className="mt-1 text-foreground">{new Date(nation.created_at).toUTCString()}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-widest text-muted-foreground">Citizens</dt>
                  <dd className="mt-1 text-foreground">{nation.citizen_count}</dd>
                </div>
              </dl>
              {nation.receipt_id ? (
                <Link
                  to="/r/$receiptId"
                  params={{ receiptId: nation.receipt_id }}
                  className="mt-5 inline-block rounded-md border border-gold/40 px-3 py-1.5 text-xs font-semibold text-gold"
                >
                  Founding proof →
                </Link>
              ) : null}
            </Panel>

            <Panel className="p-6 text-sm text-muted-foreground">
              Anyone may recompute this constitution's digest and check it against the chain. Nothing here
              asks for trust.
            </Panel>
          </div>
        </div>
      </Section>
    </>
  );
}
