# Sovereign AI Services

**The published rulebook of the verification economy** — sovereign-ai.services

This repository is the constitutional text and the reference site for the Apex PSI
verification economy: the charter, the fee schedule, the surplus-routing rules, the
amendment procedure and the membership registry rules, versioned in git so that trust
in the rules becomes a diff anyone can read.

Sovereign AI Services is a separate commercial platform, operated by Apex Intelligence
Empire (ABN 71 672 237 795), built on the neutral APEX PSI protocol. It is not a nation,
state, government or sovereign entity and confers no citizenship, nationality or legal
status. It is not a bank: Article III forbids spread, float and custody, and the platform
holds neither.

## What is live and what is modelled

The distinction is printed on the site itself, not hidden in this file:

- **Live:** the charter text, the published fee schedule ($0.001, one time, forever),
  the membership tiers, and the sealing and anchoring machinery behind the Apex PSI
  ledger.
- **Modelled:** the activity on `/transactions` (a simulated model — no paid
  transaction has ever occurred), and the chamber on `/governance` (rules and specimen
  proposal objects only — no ballot has ever opened and no vote has ever been cast).

## Where the proof lives

- Ledger, receipts and the anonymous referee: <https://ai-governance-standard.com>
  (`/impact` for live counters, `/verify-any` for the cross-standard seal reader,
  `/timeline` for the dated public history).
- Specification: IETF `draft-singh-psi` (individual submission), on the IETF datatracker.
- Verifier: MIT-licensed, at <https://github.com/kawal393/APEX-PSI>
  (`packages/psi-verifier`). Verification is free forever.
- This repository's own publication record: [`seals/`](seals) holds the ledger receipt
  for the five-primitives demonstration as pushed — receipt `APEX-NTR-B1F104711BB46D6F`,
  ledger hash `d559e76f…8738e024`, phase VERIFIED, post-quantum signature checked. It is
  verifiable by anyone at either door above, with no account.

## Licence

Split deliberately, because a verification platform that hid its own rules would be
worth nothing:

- **Platform source — proprietary.** See `LICENSE` in this repository. Copyright
  (c) 2026 Apex Intelligence Empire (ABN 71 672 237 795), Victoria, Australia. All
  rights reserved; no licence to copy, modify, redistribute or sublicense the site code.
- **Published records — free.** Everything under `/api/public/`, plus `/charter.json`,
  the `.well-known` documents, `/openapi.json`, `/llms.txt`, `/feed.xml` and
  `/sitemap.xml`, may be fetched, cached, mirrored, republished and independently
  verified by anyone, for any purpose, including commercially, with no permission and
  no account. Mirroring the ledger in full is expressly permitted and encouraged.
- **Verification — free forever.** `public/offline-verifier.html` may be copied, hosted
  and redistributed so receipts stay checkable without this platform, and the verifier
  SDKs are MIT-licensed at <https://github.com/kawal393/APEX-PSI> (`packages/psi-verifier`,
  `packages/psi-verifier-py`). The sealing engine carries its own terms
  (`LICENSE-ENGINE.txt`, same repository).
- **Marks — reserved.** "APEX PSI", "PSI-SEAL" and the seal device are trade marks of
  Apex Intelligence Empire. Nothing here grants any right in them.

Verification is free. The protocol is open. The marks are not.

## Documents

- [`compliance-mapping.md`](compliance-mapping.md) — which primitive answers which
  obligation surface. Technical reference; not legal advice.
- [`procurement-language.md`](procurement-language.md) — clauses a buyer's procurement
  team can paste into a supplier contract.
- [`primitives-demo.mts`](primitives-demo.mts) — the five primitives run end to end on
  the real engine: `node --experimental-strip-types primitives-demo.mts`.
- Enterprise conformance listing and jurisdiction packs:
  apexinfrastructure369@gmail.com — <https://apex-infrastructure.com>

## Development

```sh
npm install
npm run dev
```

## Stack

TanStack Start (React 19, Vite 8), Tailwind CSS v4, PostgreSQL backend,
Ed25519 / ML-DSA-65 / LMS sealing, OpenTimestamps anchoring.
