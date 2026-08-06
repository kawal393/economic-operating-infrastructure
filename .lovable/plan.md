# Sovereign AI Services — From Thesis to Substrate

Twelve pages exist and are visually complete, but nothing persists and no receipt can leave the site. This plan turns the thesis into a working nation-state, ordered so the self-propagating features land first.

## Phase 1 — The receipt becomes real

The single highest-leverage change: a visitor can produce an artefact that survives without us.

- **Seal**: client-side streaming SHA-256 of any file or pasted text. No upload, no account. Canonical JSON (RFC 8785) before hashing.
- **Receipt writer**: downloadable `.praman` sidecar containing digest, canonicalisation method, timestamp, issuer, predicates, and a verification URL.
- **Offline verifier**: a self-contained single-file HTML verifier, downloadable from `/verify`, that works with no network and no dependency on this site.
- **Verify page**: paste a receipt or re-upload the original; deterministic pass/fail with the reason shown.
- **Honesty layer**: every result states plainly that integrity is proven and truth is not.

## Phase 2 — Persistence and identity

Enable Lovable Cloud (database, auth, server functions, storage — no external accounts needed).

- Tables: `nation_states`, `notarizations`, `attestations`, `protocols`, `governance_proposals`, `votes`, `transactions`.
- Roles in a separate `user_roles` table with a security-definer `has_role` function. Admin checks are server-side only.
- Explicit grants on every public table; RLS on everything. Registry and explorer are public read; all writes are owner-scoped.
- Auth: email plus wallet-address binding. Wallet signature proves control; the session is server-issued.
- Dashboard, deploy, governance and transactions switch from static content to live data.

## Phase 3 — Chain, anchor, ledger

- Append-only notarization chain carrying the prior digest forward.
- Merkle root per settlement window; OpenTimestamps commitment to Bitcoin.
- Inclusion proofs downloadable per receipt.
- `/explorer`: live anonymised feed of digests with anchor status.
- `/mirror`: full ledger export so anyone can replicate it in its entirety.

## Phase 4 — The propagation features

- **Public badge embed**: a live-status script the sealed party hosts on their own site.
- **Registry with absence**: sealed and unsealed entities listed side by side, with transparency scores.
- **Counter-attestation**: symmetric rebuttal on any attestation; no takedowns, ever.
- **Territory claim**: subdomain binding to a signed constitution hash, published at a well-known path.
- **Compliance receipt PDF**: EU AI Act Article 50 format, countersigned.

## Phase 5 — Revenue and ecosystem

- Metered API verification, anchoring, and compliance checks at the published fee schedule; free permissionless verification stays free forever.
- Stripe for countersignatures and the Prover tier; webhook at `/api/public/stripe`.
- One-call SDK adapter and documented public API endpoints.
- Optional Solidity deployment for on-chain nation-state registration, kept strictly non-load-bearing so receipts verify without it.

## Technical notes

- Stack stays TanStack Start, React 19, Tailwind v4, Lovable Cloud. Server logic uses `createServerFn`; external callers use routes under `/api/public/*` with signature verification.
- Hashing uses `hash-wasm` for streaming; signatures use `@noble/ed25519` in the browser and a hybrid classical plus post-quantum suite server-side.
- Post-quantum signing runs server-side only; the browser path stays Ed25519 to keep bundle size sane.
- All colours remain semantic tokens in `src/styles.css`. No hardcoded utilities.
- Numbers currently shown as platform stats are relabelled as a projection model until real data exists.

## Risk posture carried into the build

- Anchoring proves existence at or before a block; the UI must never claim a lower bound.
- Attestations against named parties are a legal surface. The symmetric rebuttal right is enforced structurally, and jurisdictional exposure is reviewed before launch.
- APEX PSI is an individual IETF draft. Every deployment is presented as an implementation, never as conformance to an adopted standard.
- Receipts must verify with the platform switched off. Any feature that breaks this is rejected regardless of revenue.

## Suggested starting point

Phase 1 alone changes the nature of the project: it is the smallest slice that produces an artefact which markets itself and cannot be killed.
