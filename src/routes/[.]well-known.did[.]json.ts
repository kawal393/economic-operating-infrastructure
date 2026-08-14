import { createFileRoute } from "@tanstack/react-router";
import { nationKey } from "@/lib/nation-key.server";
import { ed25519Jwk } from "@/lib/interop";

/**
 * did:web:sovereign-ai.services — the nation's resolvable identity.
 * Any DID resolver, wallet or agent framework can now address us directly.
 */
export const Route = createFileRoute("/.well-known/did.json")({
  server: {
    handlers: {
      GET: async () => {
        const { publicKeyHex, keyId, did } = await nationKey();
        const id = "did:web:sovereign-ai.services";
        const vm = `${id}#seal-of-state-${keyId}`;
        const doc = {
          "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/jws-2020/v1",
          ],
          id,
          alsoKnownAs: [did, "https://sovereign-ai.services"],
          verificationMethod: [
            {
              id: vm,
              type: "JsonWebKey2020",
              controller: id,
              publicKeyJwk: ed25519Jwk(publicKeyHex, `sovereign-${keyId}`),
            },
          ],
          authentication: [vm],
          assertionMethod: [vm],
          service: [
            {
              id: `${id}#ledger`,
              type: "TransparencyLog",
              serviceEndpoint: "https://sovereign-ai.services/api/public/v1/checkpoint",
            },
            {
              id: `${id}#verify`,
              type: "IntegrityVerification",
              serviceEndpoint: "https://sovereign-ai.services/api/public/v1/verify",
            },
            {
              id: `${id}#registry`,
              type: "EntityRegistry",
              serviceEndpoint: "https://sovereign-ai.services/registry",
            },
          ],
        };
        return new Response(JSON.stringify(doc, null, 2), {
          headers: {
            "content-type": "application/did+json; charset=utf-8",
            "access-control-allow-origin": "*",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
