import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { FieldRow, HonestyNote, TabSwitch } from "@/components/seal-ui";
import { CopyBlock } from "@/components/copy-block";
import { downloadText, parseReceipt, verifyReceiptSignature, type Receipt } from "@/lib/apex-psi";
import { INTEROP_FORMATS, didKeyFromEd25519Hex, type InteropFormatId } from "@/lib/interop";

export const Route = createFileRoute("/interop")({
  head: () => ({
    meta: [
      { title: "Standards Bridge — VC, in-toto, C2PA, DSSE | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Re-express any Apex PSI receipt as a W3C Verifiable Credential 2.0, in-toto Statement, DSSE envelope or C2PA sidecar manifest — derived deterministically, entirely in your browser.",
      },
      { property: "og:title", content: "Standards Bridge — One receipt, every format" },
      {
        property: "og:description",
        content:
          "Convert Apex PSI receipts into the formats wallets, CI systems and content-provenance tools already speak.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/interop" }],
  }),
  component: InteropPage,
});

function InteropPage() {
  const [raw, setRaw] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [signatureValid, setSignatureValid] = useState<boolean | null>(null);
  const [format, setFormat] = useState<InteropFormatId>("vc");

  const active = INTEROP_FORMATS.find((f) => f.id === format)!;

  const load = async (text: string) => {
    setRaw(text);
    try {
      const parsed = parseReceipt(text);
      setReceipt(parsed);
      setSignatureValid(await verifyReceiptSignature(parsed));
    } catch {
      setReceipt(null);
      setSignatureValid(null);
      if (text.trim()) toast.error("That is not a valid Apex PSI receipt.");
    }
  };

  const output = useMemo(
    () => (receipt ? JSON.stringify(active.build(receipt), null, 2) : ""),
    [receipt, active],
  );

  return (
    <>
      <PageHeader
        eyebrow="Article II · Symmetry of Standards"
        title="The Standards Bridge"
        description="One signed fact, expressed in every language the internet already trusts. Nothing is re-signed and nothing is invented — each export is derived deterministically from the bytes the member signed."
      />

      <Section>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <Panel>
            <SectionHeading eyebrow="Input" title="Paste a receipt" />
            <textarea
              value={raw}
              onChange={(e) => void load(e.target.value)}
              rows={14}
              placeholder='{"receipt_id":"psi_…","digest":"…"}'
              className="mt-6 w-full rounded-md border border-border bg-secondary/40 p-3 font-mono text-[11px] leading-relaxed text-foreground outline-none focus:border-gold/50"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <label className="cursor-pointer rounded-md border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground">
                Load .praman file
                <input
                  type="file"
                  accept=".json,.praman,application/json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await load(await file.text());
                  }}
                />
              </label>
            </div>

            {receipt ? (
              <div className="mt-6">
                <FieldRow label="Receipt id" value={receipt.receipt_id} />
                <FieldRow label="Digest" value={receipt.digest} />
                <FieldRow label="Signer (did:key)" value={didKeyFromEd25519Hex(receipt.public_key)} />
                <FieldRow
                  label="Signature"
                  value={signatureValid ? "VERIFIED" : "INVALID"}
                  tone={signatureValid ? "success" : "danger"}
                />
              </div>
            ) : null}
          </Panel>

          <Panel>
            <SectionHeading eyebrow="Output" title="Choose a format" description={active.summary} />
            <div className="mt-6 flex flex-wrap gap-2">
              <TabSwitch
                options={INTEROP_FORMATS.map((f) => ({ value: f.id, label: f.name }))}
                value={format}
                onChange={setFormat}
              />
            </div>
            <div className="mt-6">
              <FieldRow label="Standard" value={active.standard} mono={false} />
              <FieldRow label="Consumed by" value={active.consumers} mono={false} />
              <FieldRow label="Filename" value={`receipt.${active.extension}`} />
            </div>

            {output ? (
              <>
                <CopyBlock className="mt-6" label={`receipt.${active.extension}`} value={output} />
                <button
                  type="button"
                  onClick={() => downloadText(`receipt.${active.extension}`, output)}
                  className="mt-4 rounded-md border border-gold/40 bg-gold/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold/20"
                >
                  Download
                </button>
              </>
            ) : (
              <p className="mt-6 font-mono text-xs text-muted-foreground">
                Paste a receipt to see its equivalent in this format.
              </p>
            )}
          </Panel>
        </div>

        <HonestyNote>
          A translation cannot make a claim truer. If the original receipt is a lie, the Verifiable
          Credential is the same lie in a wallet-shaped envelope. All four formats prove exactly one
          thing: these bytes existed, signed by this key, at this time.
        </HonestyNote>
      </Section>

      <Section>
        <SectionHeading eyebrow="Coverage" title="What each format unlocks" />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {INTEROP_FORMATS.map((f) => (
            <Panel key={f.id} interactive>
              <p className="eyebrow">{f.standard}</p>
              <h3 className="mt-3 text-lg font-semibold text-foreground">{f.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.summary}</p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
                {f.consumers}
              </p>
            </Panel>
          ))}
        </div>
      </Section>
    </>
  );
}
