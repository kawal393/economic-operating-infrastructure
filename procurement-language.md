# Procurement Language

Four clauses a buyer's procurement or legal team can paste into a supplier agreement,
amendment or statement of work. They are written from the **buyer's** side: they are
things a buyer should demand of any supplier whose AI output it must later evidence.

Drafting note: these are model clauses for discussion, not legal advice. Have your own
counsel adapt them to your jurisdiction, your contract structure and your risk appetite
before use.

---

## Clause 1 — Evidence of integrity

> The Supplier shall, for each AI-generated artefact delivered under this Agreement,
> deliver a provenance receipt conforming to IETF `draft-singh-psi`, comprising at
> minimum: a unique receipt identifier; a SHA-256 digest of the artefact; the
> canonicalisation method applied before digesting (RFC 8785 JSON Canonicalisation
> Scheme, or the stated equivalent for binary content); an issuance timestamp in UTC;
> a digital signature over the canonical receipt body (Ed25519, optionally with a
> hybrid post-quantum layer); and the public key or key identifier sufficient to verify
> that signature. Receipts shall be delivered in machine-readable JSON alongside the
> artefact, and shall remain retrievable by identifier for the retention period stated
> in Clause 4.

## Clause 2 — Independent verification at no cost

> The Buyer may verify any receipt without the Supplier's participation, without an
> account, and at no cost, either through the published verification endpoint or through
> a verifier the Buyer hosts itself. The Supplier shall not condition verification on
> any commercial relationship, subscription or licence fee, and shall not withdraw,
> disable or rate-limit verification access for receipts already issued. Where the
> Supplier asserts that a verification service has been discontinued, the Supplier shall
> provide the Buyer with the data and tooling necessary to continue verification
> independently.

## Clause 3 — Tamper notice and rectification

> The Supplier shall notify the Buyer in writing within five (5) business days of
> becoming aware that any delivered receipt fails verification, that a signing key has
> been compromised, or that a sealed artefact's digest no longer matches the artefact
> delivered. Where a receipt is contested, rectification shall proceed by public
> recomputation: the parties (or an agreed third party) recompute the digest and
> re-verify the signature, and the recomputation result stands as the outcome. No
> payment, settlement, commercial consideration or goodwill gesture under this Agreement
> shall entitle the Supplier to suppress, withdraw, amend or re-characterise a receipt
> that verifies, nor to prevent publication of a recomputation result.

## Clause 4 — Records, anchoring and exit

> The Supplier shall retain receipts and their associated ledger entries for the greater
> of (a) the operational lifetime of the AI system that produced the artefact, and
> (b) seven (7) years from issuance. Where the Supplier maintains a transparency log,
> it shall make available to the Buyer, on request and at no cost: the signed checkpoint
> covering the relevant entries (C2SP `tlog-checkpoint`); the inclusion path from each
> relevant entry to the checkpoint root; and evidence of anchoring of that root to a
> public, permissionless ledger outside the Supplier's control. On expiry or termination
> of this Agreement, the Supplier shall export all receipts and ledger entries relating
> to the Buyer's artefacts in JSON, in a form the Buyer can verify without the Supplier's
> systems.

---

## Optional add-on clauses

- **Foreign marks.** Where the Supplier uses another provenance format (for example
  C2PA), the Buyer may require that the Supplier not represent conformance with a format
  it does not itself implement, and that the Buyer may submit the Supplier's marks to an
  independent cross-format reader.
- **Key custody.** The Supplier shall state in writing which entity holds each signing
  key, whether any key is held in a hardware security module or an escrow arrangement,
  and how key rotation is published to relying parties.
- **Human accountability.** Each receipt covering an automated decision shall name or
  role-identify an accountable human, and the Supplier shall not seal a decision receipt
  without one.

---

## What these clauses do not give you

A receipt is evidence of **integrity, time and signature**. It is not a warranty, a
guarantee, an indemnity, a certification of compliance, or a legal opinion. Nothing in
these clauses obliges any supplier to warrant that its system is lawful, and a buyer
should not read a verifiable receipt as one. Apex Intelligence Empire provides an
independent verification service and, separately, a conformance listing for suppliers who
request it; it does not certify, and it expresses no opinion on, any supplier's
compliance.

Marks ("APEX PSI", "PSI-SEAL", the seal device) are licensed separately from any code or
data, and no clause above grants any right in them.

---

## Enquiries

Conformance listing, jurisdiction packs and buyer-side implementation support:
apexinfrastructure369@gmail.com — <https://apex-infrastructure.com>
