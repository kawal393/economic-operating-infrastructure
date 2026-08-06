# Sovereign AI Services — Build Plan (approved, revised)

## Positioning change

Sovereign AI Services is **independent of the Apex empire**. Apex PSI is the underlying
cryptographic technology, credited as a partner, not an owner.

- Primary tagline stays: "The Government of the Digital Nation-State"
- Secondary line added site-wide (header/hero/footer): **"Powered by Apex PSI — in partnership with the world's first cryptographic provenance protocol."**
- Every page that mentions sealing credits Apex PSI as the protocol, with a clear
  statement that this nation-state is an independent sovereign implementation.

## Phase 1 — The receipt becomes real (no backend needed)

**/seal**
- Drag-and-drop file input (any type, streamed, never uploaded) plus a paste-text area.
- Streaming SHA-256 via `hash-wasm` with live progress on large files.
- RFC 8785 canonical JSON of the receipt body before hashing/signing.
- Ed25519 signing in the browser via `@noble/ed25519`; keypair generated locally,
  private key never leaves the device (offered as an optional download).
- Live result panel: digest, signature, UTC timestamp, status "Sealed".
- Downloadable `.praman` receipt: `digest`, `canonicalisation_method: "RFC 8785"`,
  `timestamp`, `issuer: "sovereign-ai.services"`, `protocol: "Apex PSI"`, `predicates`
  (name, size, MIME), `verify_url`, `signatures.ed25519`, `public_key`.
- Honesty line on every result: **"Integrity proven. Truth not verified."**

**/verify**
- Accepts a `.praman` file or pasted JSON, plus the original file or text.
- Recomputes the digest, compares, verifies the Ed25519 signature against the
  embedded public key.
- PASS / FAIL panel with per-check breakdown: digest match, signature valid,
  timestamp, issuer, anchor status (added in Phase 3).
- Honesty line: "This proves the content has not been altered since sealing.
  It does not prove the content is true."

**Offline verifier**
- `public/offline-verifier.html`: one self-contained file, inlined Ed25519 + Web Crypto
  SHA-256, zero network calls, obsidian-and-gold styling, download link on /verify.
- This is Article V made physical: receipts verify without this site existing.

## Phase 2 — Persistence and identity (Lovable Cloud)

Enable Cloud, then one migration creating: `citizens`, `nation_states`, `notarizations`,
`attestations`, `governance_proposals`, `votes`, `transactions`, `user_roles` — with the
columns as specified.

Security shape (non-negotiable, adjusted from the spec where it would be unsafe):
- Roles live in `user_roles` only, keyed to the auth user, with an `app_role` enum and a
  security-definer `has_role()`. Never read roles from the client for authorization.
- GRANTs written alongside every table; RLS enabled on all.
- Public read on the ledger-ish tables (`nation_states`, `notarizations`, `attestations`,
  `governance_proposals`, `votes`) with safe-column exposure; all writes owner-scoped
  via `auth.uid()`.
- `citizens`: public read of non-PII columns only (email is not anon-readable);
  owner writes only.
- `transactions` and proposal state changes: writes via server functions only.
- One vote per `(proposal_id, voter_id)` enforced by unique constraint plus policy.

Auth:
- Email/password + Google sign-in via Cloud.
- Wallet binding: server issues a nonce, MetaMask signs it, a server function recovers
  the address and binds it to the signed-in citizen. Wallet alone never grants a session.

Live-data rewiring: `/dashboard`, `/deploy`, `/governance`, `/transactions`,
`/citizenship` move from static content to real queries and mutations. Projected figures
stay clearly labelled as a model until real volume exists.

## Phase 3 — Chain, anchor, ledger

- `createNotarization` server function: takes digest, signature, receipt JSON; reads the
  last notarization's digest; writes a new row carrying `prior_hash`. Append-only —
  no update or delete policies.
- Merkle batching: a server route under `/api/public/anchor` (secret-guarded, callable by
  a scheduler) collects unanchored rows, computes a Merkle root, submits it to
  OpenTimestamps, and stores the OTS proof and anchor state per notarization.
  Anchoring proves "existed at or before block N" — nothing stronger, and the UI says so.
- Downloadable inclusion proofs on `/verify`.
- **/explorer**: live anonymised feed of digests, timestamps, anchor status; click through
  to full detail.
- **/mirror**: paginated full-ledger export endpoint anyone can replicate.

## Phase 4 — Propagation

- **Badge**: copy-paste embed per receipt; green verified / amber pending anchor / red failed;
  links back to `/verify?id=…`.
- **/registry**: sealed entities with transparency scores, plus the absence signal listing
  named unsealed entities. Claims about third parties are factual and mechanical
  ("no receipts on record"), never accusatory, and every listed party can respond.
- **Counter-attestation**: any attestation can be rebutted; the rebuttal is itself sealed and
  anchored; nothing is ever removed; both sides render side by side.
- **Namespace territory**: each nation-state claims a name bound to its constitution hash,
  published under a well-known path. Note: `/.well-known/trust.html` and `trust.json` are
  platform-reserved, so the claim is published at `/.well-known/sovereign-ai.json`.

## Technical notes

TanStack Start server functions for all app-internal logic; `/api/public/*` routes only for
external callers (anchoring scheduler, ledger mirror), each verifying its caller.
`@noble/post-quantum` (ML-DSA-65, LMS) runs server-side only so the browser bundle stays
small — the browser signs Ed25519. No Supabase edge functions. All colours stay semantic
tokens. Any change that would break offline verification is rejected regardless of revenue.

## Sequencing

Phase 1 ships first and alone changes the nature of the project: a visitor leaves with an
artefact that outlives the site. Then Cloud and persistence, then the chain and anchors,
then propagation.
