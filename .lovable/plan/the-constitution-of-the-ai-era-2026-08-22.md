# The Constitution of the AI Era

## The rename

New name: **The Constitution of the AI Era**
New tagline: **"A constitution is only written once — but it can be updated forever."**

My honest thought: this is a stronger name than "Constitution of the Digital Nation-State". It drops the self-referential framing (a nation-state nobody has heard of yet) and claims the category instead (the era everyone is already living in). The tagline is the sharper half — it resolves the oldest tension in constitutional design: permanence versus adaptability. It also gives you a *product* hook, not just a slogan: if the document can be updated forever, then every update must be provable, and that is exactly the machinery you already built (sealing, anchoring, Merkle transparency). The tagline is a promise the ledger can keep. Most constitutions cannot make it.

One caution: "written once, updated forever" invites the question "then who updates it?". The rename only works if amendment authority is visible on the page — which is why update 1 below is not optional.

### Where the rename lands
- `/constitution` page header, eyebrow, description, and head() SEO metadata
- Footer and nav labels where "Constitution" is described
- Homepage constitution section copy
- `src/content/nation.ts` — the single source of truth strings
- `llms.txt`, `openapi.json`, `agents.json`, `sitemap` descriptions

## Five inevitable updates

### 1. The Living Amendment Ledger
Every version of the constitution is sealed, anchored and Merkle-logged. The page shows the current version number, its digest, its Bitcoin anchor, and a full diff history against v1. Anyone can verify what the constitution said on any past date.
Why inevitable: the tagline is unenforceable without it. Once versions are provable, "our terms changed silently" becomes a detectable event — and every other document on the internet looks unaccountable by comparison.

### 2. Ratification by Signature
Citizens, agents and organisations sign the current constitution digest with their key. The signature count is public and per-article. Amendment thresholds (already defined: 2/3 for Articles II–IV, unanimity for I and V) are computed from real signatures rather than asserted.
Why inevitable: it converts readers into a countable polity. A constitution with 40,000 verifiable signatories is a fact; one with none is an essay.

### 3. Machine-Readable Constitution (`/constitution.json` + article DIDs)
Each article gets a stable URI, a digest, and a JSON-LD representation an agent can fetch, cite and comply against. Agents can assert "operating under Article III, v4, digest abc…" inside their own receipts.
Why inevitable: the AI era's constitution has to be readable by the AI. This is the citation primitive other systems embed without asking permission.

### 4. Conformance Attestations
A public check that turns each article's stated failure condition into a test, run against any registered entity or against the nation itself. Results are sealed and published. Article V is self-applied first: the nation proves it cannot capture itself.
Why inevitable: articles with failure conditions are already written as tests. Running them converts moral claims into audit output — and makes non-participation legible.

### 5. Amendment Proposals in Public
Open proposal flow: anyone drafts an amendment, it is sealed on submission, enters a fourteen-day deliberation window, gets signed votes, and either merges into a new sealed version or fails with a permanent record. Failed amendments stay visible.
Why inevitable: "updated forever" needs a door. A visible, slow, cryptographically recorded door is also the strongest anti-capture argument you have.

## Technical notes

- New tables: `constitution_versions` (version, digest, full text, receipt_id, anchor, effective_from), `constitution_signatures` (signer DID/citizen id, version digest, signature, article scope), `amendments` (proposal text, status, window, sealed digest), `amendment_votes`.
- All public tables get GRANTs plus RLS: anon SELECT on versions/signatures/amendments; writes restricted to authenticated citizens.
- Version sealing reuses `src/lib/apex-psi.ts` + `transparency.server.ts` + `anchor.server.ts` — no new crypto.
- `/constitution.json` and `/constitution/v/$digest` served as signed routes using the existing nation seal (RFC 9421 headers), same pattern as the v1 API.
- Content moves from a static `ARTICLES` constant to a DB-backed current version, with `nation.ts` retained as the v1 seed inserted via migration literals.

## Suggested order
Rename and copy pass first (immediate), then 1 + 3 together (versioning gives article URIs their meaning), then 2, then 5, then 4.
