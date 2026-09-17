# Compliance Mapping — APEX PSI primitives against obligation surfaces

**Technical reference. Not legal advice.** A receipt proves three things and only three
things: the bytes that were sealed, the time they were sealed, and the signature over
both. It proves nothing about lawfulness. Apex Intelligence Empire expresses no opinion
on any person's compliance status, and nothing here should be relied on as an audit,
an assessment, a certification or advice.

Vocabulary used below is deliberate: a *recomputation result*, never a finding or an
accusation; an *independent verification service*, never an audit.

---

## The matrix

| # | Obligation surface | What it asks for | Which primitive answers it | What the receipt actually supplies | Status |
|---|---|---|---|---|---|
| 1 | **EU AI Act Art 12 — record-keeping** | Logs of provider activity, automatically recorded, retained over the system's lifetime | `SEAL` + `ANCHOR` | One immutable receipt per action: `receipt_id`, SHA-256 digest, RFC 8785 canonical body, Ed25519 signature, hash-chained ledger entry, signed C2SP `tlog-checkpoint` | **Live.** Ledger and receipts are public and enumerable at `/api/public/` |
| 2 | **EU AI Act Art 50 — transparency** | Persons interacting with, or exposed to synthetic content from, an AI system must be informed in a machine-detectable way | `VERIFY` | A `verify_url` anyone can open with no account, plus the offline verifier that can be copied and self-hosted; the referee also reads C2PA and foreign marks | **Live.** Verification is free, permanent and does not require our tooling |
| 3 | **EU AI Act Art 11 / Annex IV — technical documentation** | Documented artefacts, versioned and attributable | `CITE` | Digests and identifiers of the cited artefacts pinned inside the sealed predicate, so a document set cannot be silently re-dated after the fact | **Partial.** We seal and cite digests; the documentation set itself remains the deployer's obligation |
| 4 | **Serious-incident and authority reporting (Art 72–73)** | Evidence handed to a regulator whose timestamp is not controlled by the reporting party | `ANCHOR` | A timestamp anchored to the Bitcoin chain tip through OpenTimestamps — outside our custody, outside our ability to revise, verifiable by the authority itself | **Live for anchoring.** The reporting process, thresholds and deadlines stay with the provider |
| 5 | **Procurement and management-system evidence (ISO/IEC 42001, 27001)** | Demonstrable operation of controls, evidenced to a third party | `AUDIT` | Third-party recomputation: any counterparty re-derives the digest and re-checks the signature. No trust in us is required at any point | **Live.** The referee favours no format, including its own |

---

## Japan — mapped 18 September 2026

The FSA published **Strategic Priorities: July 2026 – June 2027** on 15 September 2026
(fsa.go.jp), committing to stricter enforcement against unregistered operators and to
using generative AI inside the agency for policy, supervision, monitoring and market
surveillance. The surface that creates is the same everywhere: a finding produced by
an AI system needs a trail no party controls, or the finding is challengeable. Rows
6–10 map that surface. Japan adopting any standard is its own future process and
nothing here presumes it; this mapping only makes the specification findable when the
question is asked. Japanese act titles are given without article citations on purpose:
the mapping names surfaces, not legal conclusions.

| # | Obligation surface | What it asks for | Which primitive answers it | What the receipt actually supplies | Status |
|---|---|---|---|---|---|
| 6 | **FSA Strategic Priorities FY2026–27 — AI-enabled supervision** | A finding produced by the authority's own generative AI must withstand "prove what your system did, when, on which inputs" | `SEAL` + `CITE` | Prompt digests, outputs and timestamps sealed at creation; the bytes and the time recompute for anyone — including the authority that issued the finding | **Live.** The receipt proves integrity and time; supervision itself is the FSA's mandate |
| 7 | **FIEA — supervision of algorithmic and AI-assisted systems** | Firms must evidence how an algorithmic system behaved at decision time when examiners ask | `SEAL` + `ANCHOR` | Per-decision receipts with a timestamp anchored to the Bitcoin chain tip — outside our custody, outside anyone's ability to revise | **Live for anchoring.** Books, records and reporting duties remain the firm's |
| 8 | **APPI — third-party provision and cross-border transfer records** | Prove what personal information left, to whom, under what instructions, and when | `SEAL` + `CITE` | Transfer manifests and processor instructions sealed as data; cited digests cannot be silently re-dated after the fact | **Live.** Evidence of integrity and time — not a lawful-transfer determination |
| 9 | **APPI — leakage and breach reporting** | Report incidents with evidence whose timestamp the reporting party does not control | `ANCHOR` | An OpenTimestamps proof against the Bitcoin chain tip, verifiable independently by the PPC and by any affected person | **Live for anchoring.** Thresholds, deadlines and assessment remain the operator's |
| 10 | **Act on Promotion of R&D and Utilization of AI-Related Technologies (2025)** | AI businesses may be asked to provide information to the government; records must be producible on demand | `AUDIT` | Any counterparty — including an authority — re-derives the digest and re-checks the signature without trusting us at any point | **Live.** Cooperation duties sit with the business; receipts make production instant and verifiable |

---

## How to read the five primitives

The five primitives are profiles on one engine. There are five verbs underneath, and the
verbs are what an engineer should ask for:

| Verb | One line | Fails loudly if |
|---|---|---|
| `SEAL` | Canonicalise, digest, sign, issue a receipt | The signature does not verify against the published key |
| `VERIFY` | Recompute the digest and re-check the signature | One byte differs anywhere in the canonical body |
| `ANCHOR` | Commit the batch root to the Bitcoin chain tip | The checkpoint root does not match the ledger it claims to cover |
| `CITE` | Pin identifiers and digests of referenced artefacts | A cited artefact's digest has moved since citation |
| `AUDIT` | Let an outsider recompute the whole chain and tree | An inclusion path does not reconstruct the signed root |

A working demonstration of all five, including two deliberate tamper attempts that must
fail, is in [`primitives-demo.mts`](primitives-demo.mts).

---

## What this mapping cannot do

- It does not classify a system. Risk classification under the EU AI Act is the
  provider's and the deployer's determination.
- It does not substitute for a conformity assessment, a notified body, or a
  fundamental-rights impact assessment.
- It does not create a presumption of conformity. A sealed receipt is evidence of
  integrity and time, and it is admissible to that extent and no further.
- It does not cover jurisdictions we have not mapped. Unmapped does not mean
  non-compliant; it means we have not published the mapping.

Money buys process here, never outcome. Rectification is paid recomputation: the maths
decides the result, and no fee can suppress, soften or withdraw a receipt that verifies.

---

## Enquiries

Enterprise conformance listing and jurisdiction packs:
apexinfrastructure369@gmail.com — <https://apex-infrastructure.com>

Specification: IETF `draft-singh-psi` (individual submission), on the IETF datatracker.
