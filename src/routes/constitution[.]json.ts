import { createFileRoute } from "@tanstack/react-router";
import { CORS_PREFLIGHT, signedJson } from "@/lib/nation-key.server";
import { readVersions } from "@/lib/constitution.server";
import {
  articleDigest,
  articleUri,
  canonicalConstitution,
  constitutionDigest,
  CONSTITUTION_NAME,
  CONSTITUTION_TAGLINE,
  AMENDMENT_THRESHOLDS,
} from "@/lib/constitution";

/**
 * The Charter, machine-readable and signed. An agent can fetch this,
 * pin an article digest, and cite the exact clause it operates under.
 */
export const Route = createFileRoute("/constitution.json")({
  server: {
    handlers: {
      OPTIONS: () => CORS_PREFLIGHT.clone(),
      GET: async () => {
        const versions = await readVersions().catch(() => []);
        const version = versions[0]?.version ?? 1;
        const doc = canonicalConstitution(version);

        return signedJson(
          {
            "@context": ["https://www.w3.org/ns/credentials/v2", "https://schema.org"],
            type: ["Protocol Charter", "CreativeWork"],
            id: "https://sovereign-ai.services/Charter.json",
            name: CONSTITUTION_NAME,
            tagline: CONSTITUTION_TAGLINE,
            issuer: "did:web:sovereign-ai.services",
            version,
            digest: constitutionDigest(doc),
            digest_algorithm: "SHA-256",
            canonicalisation_method: "RFC 8785 JCS (documented key order)",
            effective_from: versions[0]?.effective_from ?? null,
            anchor_status: versions[0]?.anchor_status ?? "pending",
            articles: doc.articles.map((a) => ({
              id: articleUri(a.slug),
              numeral: a.numeral,
              slug: a.slug,
              name: a.name,
              right: a.right,
              thesis: a.thesis,
              body: a.body,
              guarantees: a.guarantees,
              digest: articleDigest(a, version),
              amendment_threshold: AMENDMENT_THRESHOLDS[a.numeral]?.rule ?? "two-thirds",
            })),
            history: versions.map((v) => ({
              version: v.version,
              digest: v.digest,
              summary: v.summary,
              effective_from: v.effective_from,
              anchor_status: v.anchor_status,
            })),
            amendments: "https://sovereign-ai.services/amendments",
            conformance: "https://sovereign-ai.services/Charter#conformance",
          },
          { cacheSeconds: 300 },
        );
      },
    },
  },
});
