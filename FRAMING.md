# The Layer Lock — Apex PSI is a substrate, not a tool

This file is the canonical framing statement for the whole estate. It is protocol
defence, not marketing. The moment the world files a protocol under "tools", it gets
compared to tools, priced like tools, and replaced by a better tool. DNS was never a
directory; TCP/IP was never an application; TLS was never a browser feature. They
survived because enough people refused to describe them as anything but the layer.

The lock is printed in the footer of every door and at the head of every
specification. The constant lives in `src/content/nation.ts` as `LAYER_LOCK`; the
public door's copy lives beside it (`FOOTER_CONSTITUTION_LINES` in the PSI site).

---

## THE LOCK (three sentences, never edited, never abridged)

> **Apex PSI is not a tool and not a product. It is the verification substrate — the
> layer beneath proof. It does not judge. It does not certify. It only remembers.**

Everything already printed stays true beside it and is never replaced by it:

- "The ledger does not judge. It remembers."
- "We do not validate content. We validate timestamp and existence."
- "This record certifies existence, timestamp and integrity — not the truth of any claim."

---

## Why the word "service" is deliberately absent

The legal fence (charter vocabulary, terms, disclaimers) names the **business** an
*independent verification service* — because that is what a court, a regulator and a
buyer can understand, and because it is honest: the estate operates a service. The
**protocol** is the layer the service runs on. Saying "PSI is not a service" would
contradict our own fence and hand a critic an easy catch. The distinction is stable
and repeatable:

- **The protocol** is the layer. Free, open, no account, no permission.
- **Applications and services** — including ours — are built on the layer.
- The layer does not judge, certify or opine. Applications may do work; the layer
  only remembers.

---

## THE DNS TEST — how every question is answered

Never answer "what does PSI do?" with a use case. Use cases are how a layer gets
filed under tools. Answer with the layer:

| Wrong (collapses to a product) | Right (holds the layer) |
|---|---|
| "It verifies AI outputs" | "It is the layer AI verification runs through" |
| "It checks documents" | "It anchors documents to immutable, re-checkable state" |
| "It helps with compliance" | "Compliance systems build their proofs on the substrate" |
| "It is an audit tool" | "Audit tools consume receipts from the layer" |
| "It is a blockchain" | "It is a transparency layer that anchors to one" |

---

## THE INVITATION RULE — we never compete with applications

If a company builds compliance software, a provenance tool, or an evidence product,
we never say "we do that better". The only response is:

> "That is an excellent application. Anchor its proofs to Apex PSI so they remain
> independently verifiable forever — by anyone, with no account, free."

Every "competitor" described this way becomes a potential tenant of the layer. Tools
fight tools. The substrate outlives all of them, because they need somewhere to stand.

---

## THE DIAGRAM — one picture, every presentation, forever

```
+----------------------------------------------------+
|  Applications: AI · Courts · Banks · Registries    |   <- they build here
+----------------------------------------------------+
|  Apex PSI — verification substrate                 |   <- the layer. no product.
+----------------------------------------------------+
|  Time · Ledger · Immutable state                   |   <- what the layer rests on
+----------------------------------------------------+
```

If anyone asks "where is your product?", point at the middle band: there is no
product. There is a layer, and everything above it is somebody's application.

---

## THE CORRECTION SCRIPT — when someone misfiles it

Said gently, every time, without exception:

> "That is an application built on Apex PSI. Apex PSI itself is the verification
> layer — the substrate those tools run on top of."

No argument beyond that sentence. The layer does not debate; it anchors, and the
receipt either recomputes or it does not.

---

## Where this lock is printed

- This platform's footer (`src/components/site-chrome.tsx`, from `LAYER_LOCK`).
- The public door's footer and constitution copy (`ai-governance-standard.com`).
- The head of every verifier README (`APEX-PSI`, `apex-verify`, `apex-verify-python`,
  `apex-psi-mcp-server`).
- The head of every future pillar repository and specification.
