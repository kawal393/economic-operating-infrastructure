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
- **Modelled:** the scale projections on `/treasury` (labelled as a model with its
  formula printed), the activity on `/transactions` (a simulated model — no paid
  transaction has ever occurred), and the chamber on `/governance` (rules and specimen
  proposal objects only — no ballot has ever opened and no vote has ever been cast).

## Where the proof lives

- Ledger, receipts and the anonymous referee: <https://ai-governance-standard.com>
  (`/impact` for live counters, `/verify-any` for the cross-standard seal reader,
  `/timeline` for the dated public history).
- Specification: IETF `draft-singh-psi` (individual submission), on the IETF datatracker.
- Verifier: MIT-licensed, at <https://github.com/kawal393/APEX-PSI>
  (`packages/psi-verifier`). Verification is free forever.

## Licence

No `LICENCE` file has been added to this repository yet, so under copyright law its
contents are all rights reserved despite being public. The sealing engine is separately
licensed (`LICENSE-ENGINE.txt` in the APEX-PSI repository); the verifiers are MIT. Any
licence added here is a steward decision, and this line will be replaced the day it is.

## Development

```sh
bun install
bun run dev
```

## Stack

TanStack Start (React 19, Vite 7), Tailwind CSS v4, PostgreSQL backend,
Ed25519 / ML-DSA-65 / LMS sealing, OpenTimestamps anchoring.
