# Verifiable AI Observatory — Build Plan

## 1. Strategic Foundation: Why Provenance Is the Next Public Utility

AI is becoming the dominant industrial layer. The EU AI Act, deepfake exposure, and the collapse of trust in synthetic content have created a single missing public utility: **machine-checkable truth receipts**. APEX PSI/PRAMAAN provides the cryptographic substrate. The product turns that substrate into a usable civic and commercial tool.

A default canon of 20 books was used to ground the design. The synthesis is based on their publicly known arguments, not fresh close-reading of every page. The canon spans economics, technology, AI, protocols, and business:

- Economics: *The Wealth of Nations* (Smith), *Capital in the Twenty-First Century* (Piketty), *The Theory of Moral Sentiments* (Smith), *Doughnut Economics* (Raworth), *The Black Swan* (Taleb), *The Ascent of Money* (Ferguson), *Freakonomics* (Levitt & Dubner), *Debt: The First 5,000 Years* (Graeber)
- Technology: *The Innovator's Dilemma* (Christensen), *The Second Machine Age* (Brynjolfsson & McAfee), *The Singularity Is Near* (Kurzweil), *The Master Algorithm* (Domingos), *The Stack* (Bratton), *Platform Revolution* (Parker, Van Alstyne & Choudary)
- AI: *Superintelligence* (Bostrom), *Human Compatible* (Russell), *The Alignment Problem* (Christian), *Life 3.0* (Tegmark), *The Coming Wave* (Suleyman), *Power and Progress* (Acemoglu & Johnson)
- Protocols: *The Bitcoin Standard* (Ammous), *The Internet of Money* (Antonopoulos), *Mastering Bitcoin* (Antonopoulos), *Attack of the 50 Foot Blockchain* (Gerard), *The Token Economy* (Voshmgir)
- Business: *Zero to One* (Thiel), *The Lean Startup* (Ries), *The Hard Thing About Hard Things* (Horowitz), *Crossing the Chasm* (Moore), *Blitzscaling* (Hoffman & Yeh)

### Core themes extracted

1. **Trust as infrastructure, not as brand.** Smith, Taleb, and Ferguson converge on the same point: markets collapse when trust is centralized in a single actor. Piketty and Acemoglu add that institutional design determines who captures value. A verifiable ledger must be a commons, not a monopoly.
2. **The protocol beats the platform.** The Internet, Bitcoin, and early web architecture show that thin protocols with broad participation outlast fat platforms. The observatory must be a public-good interface, not a rent-seeking gatekeeper.
3. **The AI transition creates a liability stack.** Bostrom, Russell, Christian, and Suleyman all point to the same commercial risk: opacity in AI systems becomes a liability. Suleyman calls it the "containment problem for business." The observatory turns compliance into a public signal.
4. **Crypto-graphy, not crypto-currency.** Antonopoulos and Gerard together teach the difference: the useful part is the auditability, not the speculation. The business model must be transparent, low-margin, and anchored to real value (countersignatures, not tokens).
5. **Cross the chasm with a single clear use case.** Moore and Ries agree that general-purpose technology fails until it solves one painful job for one beachhead user. The first beachhead is the EU AI Act Article 50 compliance receipt.

These principles shape every product and technical decision below.

## 2. Product Vision: Verifiable AI Observatory

A public-good web application that lets anyone seal, verify, and inspect AI-generated content and human witnessed media. It has two public faces and one operator dashboard.

### Public portal

- **Seal** (`/seal`): drop any file or paste text; get a client-side SHA-256 hash and a `.praman` receipt. No upload. No account.
- **Verify** (`/verify`): paste a receipt or upload the original file; get a deterministic yes/no plus predicate details.
- **Registry** (`/registry`): a public, searchable list of verified AI systems and suppliers with their public trust anchors, compliance predicates, and transparency scores.
- **Explorer** (`/explorer`): a live, anonymized feed of recent notarizations (hashes only) with Merkle root and Bitcoin/Polygon anchor status.

### Operator dashboard (authenticated)

- Connect an AI system via API key or SDK adapter.
- Batch-notarize decisions (up to 100 per call, matching the APEX PSI Prover plan).
- Download EU AI Act Article 50 compliance receipts as PDFs.
- View audit trails, risk-classification predicates, and webhook deliveries.
- Pay per countersignature or subscribe to Prover tier.

### Commercial model

- Free: seal, verify, public registry, explorer.
- Paid: $29 per Article 50 countersigned receipt, $49/mo Prover API (mirroring APEX pricing), or white-label enterprise.
- No token. No speculation. Revenue is tied to a real service (institutional countersignature and API volume).

## 3. Technical Architecture

Stack: TanStack Start (already scaffolded), React 19, Tailwind v4, Lovable Cloud (Supabase) for auth and persistence, Vite 7.

### Client-side provenance

- Use `hash-wasm` for streaming SHA-256 of large files in the browser.
- Use `@noble/ed25519` for ephemeral key generation and signing (ephemeral mode).
- Build a `.praman` receipt JSON writer matching the APEX PSI draft spec.
- Implement C2PA-compatible in-band embedding only if a server-side adapter is later added; for MVP use sidecar receipts.

### Server functions

- `notarize`: accept a digest + context + predicates, return a signed receipt with inclusion proof.
- `notarizeBatch`: accept up to 100 records, return a Merkle receipt.
- `verify`: accept a receipt or digest, return `{ valid, issuer, predicates, anchored }`.
- `listRegistry`: paginated, searchable supplier registry.
- `getExplorerFeed`: recent public notarizations with anchor status.

### Database (Lovable Cloud)

- `public.notarizations`: id, digest, merkle_root, receipt_json, predicates, anchored_at, created_at.
- `public.systems`: id, name, owner_id, trust_anchor_url, predicates, verified, transparency_score.
- `public.users`: standard auth users.
- `public.user_roles`: admin, operator, viewer (roles stored in separate table per security rules).
- RLS policies: users read their own records; admins read all; registry is public read.

### Payments

- Stripe for one-off countersignatures and subscriptions.
- Webhook endpoint at `/api/public/stripe` for receipt fulfillment.

### AI integration

- Optional: a `Compliance-Receipt` header adapter for OpenAI, Anthropic, and Vercel AI SDK to show in documentation.
- Server-side notarization function for any LLM output that passes through the app.

## 4. Build Phases

### Phase 0 — Foundation (this plan)

- Confirm the product direction and default canon.
- Set up Lovable Cloud, Stripe, and the APEX trust anchor integration.
- Define the receipt schema, database schema, and RLS policies.

### Phase 1 — Public Seal & Verify

- Replace the placeholder index with the observatory landing page.
- Build `/seal` and `/verify` routes.
- Implement client-side hashing and receipt generation.
- Implement server-side verification against the APEX trust anchor.
- Add public registry skeleton and explorer feed.

### Phase 2 — Operator Dashboard & Compliance

- Add authentication (Lovable Cloud auth).
- Build operator dashboard for system registration, batch notarization, and audit trail.
- Integrate Stripe for countersignatures and Prover subscription.
- Add PDF receipt generation for Article 50.

### Phase 3 — Scale & Ecosystem

- Add SDK adapter documentation and open API endpoints.
- Add white-label/custom-domain institutional tier.
- Add ZK fraud proof demonstrator (as per APEX spec).
- Add analytics and transparency scoring.

## 5. Honest Risks & Limitations

- APEX PSI is an individual IETF draft, not an adopted standard.
- The APEX foundation is described as "in formation." The observatory must be designed to survive if any single trust anchor disappears (offline verification, trust-anchor rotation).
- Bitcoin anchoring gives an upper bound on time, not a lower bound.
- The protocol proves integrity, not truth. The UI must be explicit that sealing a false statement produces a verifiable false statement.
- Roles are stored in a separate `user_roles` table; admin checks are server-side only.

## 6. Immediate Next Steps

If you approve this plan, I will:

1. Enable Lovable Cloud and set up the database schema with proper RLS and grants.
2. Build the public seal/verify experience as the new home page.
3. Seed the registry with a few example systems so the first screen is not empty.

This is a public-good product with a clear, paid upgrade path. It matches the APEX technology and the EU AI Act timing. No tokens, no hype — just receipts that survive regulation.
