import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel, Section } from "@/components/primitives";
import { listNationStates } from "@/lib/citizen.functions";
import type { NationState } from "@/lib/nation-types";

export const Route = createFileRoute("/registry/")({
  loader: async () => listNationStates(),
  head: () => ({
    meta: [
      { title: "Registry of Workspaces | Sovereign AI Services" },
      {
        name: "description",
        content:
          "The open registry of sovereign workspaces. Every entry carries a sealed Charter hash, a ledger receipt and a Bitcoin anchor. Public to read, impossible to forge.",
      },
      { property: "og:title", content: "The Registry of Workspaces" },
      {
        property: "og:description",
        content: "Every sovereign workspace deployed on the protocol, with its Charter hash.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/registry" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/registry" }],
  }),
  component: RegistryPage,
});

function RegistryPage() {
  const nations = Route.useLoaderData();

  return (
    <>
      <PageHeader
        eyebrow="Registry"
        title="Every workspace ever deployed, listed forever."
        description="A registry no one can be delisted from and no one can buy their way up. Ordering is chronological; standing is cryptographic."
      />

      <Section>
        {nations.length === 0 ? (
          <Panel className="p-8 text-sm text-muted-foreground">
            No workspace has been deployed yet.{" "}
            <Link to="/deploy" className="text-gold">
              Be the first →
            </Link>
          </Panel>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {nations.map((nation: NationState) => (
              <Panel key={nation.id} interactive className="p-6">
                <Link to="/registry/$slug" params={{ slug: nation.slug ?? "" }} className="block">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">{nation.name}</h2>
                  {nation.tagline ? (
                    <p className="mt-1 text-sm text-muted-foreground">{nation.tagline}</p>
                  ) : null}
                  <p className="mt-4 break-all font-mono text-[11px] text-gold">
                    sha256:{nation.constitution_hash.slice(0, 32)}…
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {nation.namespace ?? "namespace undeclared"} ·{" "}
                    {new Date(nation.created_at).toUTCString()}
                  </p>
                </Link>
              </Panel>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
