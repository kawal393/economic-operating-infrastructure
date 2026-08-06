import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel, Section } from "@/components/primitives";
import { DropZone, FieldRow, HonestyNote, TabSwitch } from "@/components/seal-ui";
import {
  digestFile,
  digestText,
  formatBytes,
  parseReceipt,
  verifyReceiptSignature,
  type Receipt,
} from "@/lib/apex-psi";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify a Receipt — Apex PSI | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Verify any .praman receipt against its original content. Digest comparison and Ed25519 signature checking run entirely in your browser, or offline with the downloadable verifier.",
      },
      { property: "og:title", content: "Verify a Receipt — Apex PSI" },
      {
        property: "og:description",
        content:
          "Check digest match and Ed25519 signature validity for any Apex PSI receipt. Works in-browser and fully offline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/verify" }],
  }),
  component: VerifyPage,
});

type Mode = "file" | "text";

const MODES = [
  { value: "file" as const, label: "Original file" },
  { value: "text" as const, label: "Original text" },
];

type Result = {
  pass: boolean;
  digestMatch: boolean;
  signatureValid: boolean;
  computed: string;
  reason: string;
  receipt: Receipt;
};

function VerifyPage() {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptJson, setReceiptJson] = useState("");
  const [mode, setMode] = useState<Mode>("file");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function readReceipt(): Promise<Receipt> {
    if (receiptFile) return parseReceipt(await receiptFile.text());
    if (receiptJson.trim()) return parseReceipt(receiptJson);
    throw new Error("Provide a .praman receipt file or paste the receipt JSON");
  }

  async function verify() {
    setWorking(true);
    setResult(null);
    try {
      const receipt = await readReceipt();
      const computed =
        mode === "file"
          ? originalFile
            ? await digestFile(originalFile)
            : ""
          : await digestText(originalText);
      if (!computed) throw new Error("Provide the original content to verify against");

      const digestMatch = computed.toLowerCase() === receipt.digest.toLowerCase();
      const signatureValid = await verifyReceiptSignature(receipt);
      const pass = digestMatch && signatureValid;
      const reason = pass
        ? "Digest matches and the receipt signature is valid."
        : !signatureValid && !digestMatch
          ? "The content does not match the sealed digest and the receipt signature is invalid."
          : !digestMatch
            ? "The content has changed since sealing — the recomputed digest does not match the receipt."
            : "The receipt itself has been altered — the Ed25519 signature does not verify.";

      setResult({ pass, digestMatch, signatureValid, computed, reason, receipt });
    } catch (error) {
      toast.error("Verification could not run", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setWorking(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Apex PSI · Verification"
        title="Verify"
        description="Check any receipt against the artefact it describes. Every check runs in your browser. If this site ever disappears, the offline verifier below does exactly the same job with no network at all."
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Panel>
            <h2 className="text-lg font-semibold tracking-tight">1 · The receipt</h2>
            <div className="mt-5">
              <DropZone
                label="Drop the .praman receipt"
                hint="Or paste the receipt JSON below."
                file={receiptFile}
                onFile={setReceiptFile}
                accept=".praman,.json,application/json"
              />
              <textarea
                value={receiptJson}
                onChange={(e) => setReceiptJson(e.target.value)}
                rows={5}
                placeholder='{"version":"1.0","protocol":"Apex PSI", …}'
                className="mt-4 w-full resize-y rounded-lg border border-border bg-secondary/30 px-4 py-3 font-mono text-xs leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold/50"
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight">2 · The original content</h2>
              <TabSwitch options={MODES} value={mode} onChange={setMode} />
            </div>
            <div className="mt-5">
              {mode === "file" ? (
                <DropZone
                  label="Drop the original file"
                  hint="Streamed through SHA-256 locally. Never uploaded."
                  file={originalFile}
                  onFile={setOriginalFile}
                />
              ) : (
                <textarea
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  rows={8}
                  placeholder="Paste the original text exactly as it was sealed…"
                  className="w-full resize-y rounded-lg border border-border bg-secondary/30 px-4 py-3 font-mono text-xs leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold/50"
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => void verify()}
              disabled={working}
              className="mt-6 w-full rounded-md border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
            >
              {working ? "Verifying…" : "Verify"}
            </button>
          </Panel>

          <div className="flex flex-col gap-8">
            <Panel>
              <h2 className="text-lg font-semibold tracking-tight">Result</h2>
              {result ? (
                <>
                  <div
                    className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 ${
                      result.pass
                        ? "border-success/35 bg-success/10"
                        : "border-destructive/35 bg-destructive/10"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${result.pass ? "bg-success" : "bg-destructive"}`}
                    />
                    <span
                      className={`font-mono text-[11px] uppercase tracking-[0.18em] ${
                        result.pass ? "text-success" : "text-destructive"
                      }`}
                    >
                      {result.pass ? "Pass" : "Fail"}
                    </span>
                  </div>
                  <p
                    className={`mt-4 text-sm leading-relaxed ${result.pass ? "text-foreground" : "text-destructive"}`}
                  >
                    {result.reason}
                  </p>

                  <div className="mt-5">
                    <FieldRow
                      label="Digest match"
                      value={result.digestMatch ? "Match" : "No match"}
                      tone={result.digestMatch ? "success" : "danger"}
                    />
                    <FieldRow
                      label="Signature"
                      value={result.signatureValid ? "Valid Ed25519" : "Invalid"}
                      tone={result.signatureValid ? "success" : "danger"}
                    />
                    <FieldRow label="Receipt digest" value={result.receipt.digest} />
                    <FieldRow label="Recomputed digest" value={result.computed} />
                    <FieldRow label="Sealed at (UTC)" value={result.receipt.timestamp} />
                    <FieldRow label="Issuer" value={result.receipt.issuer} />
                    <FieldRow label="Protocol" value={result.receipt.protocol} />
                    <FieldRow
                      label="Predicates"
                      value={`${result.receipt.predicates?.name ?? "—"} · ${formatBytes(result.receipt.predicates?.size ?? 0)}`}
                    />
                    <FieldRow label="Bitcoin anchor" value="Pending — anchoring ships next" tone="warning" />
                  </div>

                  <HonestyNote>
                    This proves the content has not been altered since sealing. It does not prove
                    the content is true.
                  </HonestyNote>
                </>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Supply a receipt and the original content. Verification compares the recomputed
                  SHA-256 against the sealed digest, then checks the Ed25519 signature over the
                  RFC 8785 canonical form of the receipt body.
                </p>
              )}
            </Panel>

            <Panel className="border-gold/25">
              <h2 className="text-lg font-semibold tracking-tight">Verify without us</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Article V — Anti-Archon. No verification may depend on the verifier's existence.
                The offline verifier is a single self-contained HTML file: no network calls, no
                dependency on sovereign-ai.services, no account. Keep a copy. If this nation-state
                is seized, censored or shut down, every receipt ever issued still verifies.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="/offline-verifier.html"
                  download="apex-psi-offline-verifier.html"
                  className="rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
                >
                  Download offline verifier
                </a>
                <Link
                  to="/seal"
                  className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Seal something
                </Link>
              </div>
            </Panel>
          </div>
        </div>
      </Section>
    </>
  );
}
