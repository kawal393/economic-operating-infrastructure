import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { publishReceipt } from "@/lib/ledger.functions";

import { toast } from "sonner";
import { PageHeader, Panel, Section } from "@/components/primitives";
import { DropZone, FieldRow, HonestyNote, TabSwitch } from "@/components/seal-ui";
import {
  buildReceipt,
  canonicalise,
  digestFile,
  digestText,
  downloadText,
  formatBytes,
  generateKeypair,
  toHex,
  type Receipt,
} from "@/lib/apex-psi";

export const Route = createFileRoute("/seal")({
  head: () => ({
    meta: [
      { title: "Seal — Apex PSI Notarisation | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Seal any file or text in your browser. Streaming SHA-256, RFC 8785 canonicalisation and an Ed25519 signature produce a portable .praman receipt. Nothing is uploaded.",
      },
      { property: "og:title", content: "Seal — Apex PSI Notarisation" },
      {
        property: "og:description",
        content:
          "Client-side sealing: streaming SHA-256, Ed25519 signature, downloadable .praman receipt. No account, no upload.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/seal" }],
  }),
  component: SealPage,
});

type Mode = "file" | "text";

const MODES = [
  { value: "file" as const, label: "File" },
  { value: "text" as const, label: "Text" },
];

function SealPage() {
  const [mode, setMode] = useState<Mode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [working, setWorking] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [secretKeyHex, setSecretKeyHex] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const publishFn = useServerFn(publishReceipt);

  async function publish(current: Receipt) {
    setPublishing(true);
    try {
      const result = await publishFn({ data: { receipt: JSON.stringify(current) } });
      if (!result.ok) {
        toast.error("Not published", { description: result.reason });
        return;
      }
      setPublished(true);
      toast.success(
        result.alreadyPresent ? "Already on the chain" : "Published to the public ledger",
        { description: `Chain position #${result.entry.sequence}` },
      );
    } catch {
      toast.error("Publishing failed", { description: "The ledger did not accept the receipt." });
    } finally {
      setPublishing(false);
    }
  }


  async function seal() {
    if (mode === "file" && !file) {
      toast.error("Select a file to seal");
      return;
    }
    if (mode === "text" && text.trim().length === 0) {
      toast.error("Paste some text to seal");
      return;
    }
    setWorking(true);
    setProgress(0);
    setReceipt(null);
    setPublished(false);
    try {
      const digest =
        mode === "file" && file
          ? await digestFile(file, setProgress)
          : await digestText(text);
      setProgress(1);

      const keypair = await generateKeypair();
      const built = await buildReceipt({
        digest,
        predicates:
          mode === "file" && file
            ? {
                source: "file",
                name: file.name,
                size: file.size,
                mime: file.type || "application/octet-stream",
              }
            : {
                source: "text",
                name: "pasted-text.txt",
                size: new TextEncoder().encode(text).length,
                mime: "text/plain; charset=utf-8",
              },
        keypair,
      });
      setSecretKeyHex(toHex(keypair.secretKey));
      setReceipt(built);
      toast.success("Sealed", { description: "Integrity proven. Truth not verified." });
    } catch (error) {
      toast.error("Sealing failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setWorking(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Apex PSI · Notarisation"
        title="Seal"
        description="Hash, canonicalise and sign any artefact entirely inside your browser. No account, no upload, no server. You leave with a receipt that verifies without this site."
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight">Content</h2>
              <TabSwitch options={MODES} value={mode} onChange={setMode} />
            </div>

            <div className="mt-6">
              {mode === "file" ? (
                <DropZone
                  label="Drop a file, or click to choose"
                  hint="Any file type, any size. The bytes are streamed through SHA-256 locally in 4 MB chunks and never leave this device."
                  file={file}
                  onFile={setFile}
                />
              ) : (
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={10}
                  placeholder="Paste the text, document or model output you want to seal…"
                  className="w-full resize-y rounded-lg border border-border bg-secondary/30 px-4 py-3 font-mono text-xs leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold/50"
                />
              )}
            </div>

            {working ? (
              <div className="mt-5">
                <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-gold transition-[width] duration-150"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Hashing · {Math.round(progress * 100)}%
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void seal()}
              disabled={working}
              className="mt-6 w-full rounded-md border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
            >
              {working ? "Sealing…" : "Seal this content"}
            </button>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              SHA-256 (hash-wasm, streamed) · RFC 8785 canonical JSON · Ed25519 (@noble/ed25519).
              The signing key is generated in this tab and is never transmitted.
            </p>
          </Panel>

          <Panel className={receipt ? "shadow-[var(--glow-gold)]" : ""}>
            <h2 className="text-lg font-semibold tracking-tight">Receipt</h2>
            {receipt ? (
              <>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-success">
                    Sealed
                  </span>
                </div>

                <div className="mt-5">
                  <FieldRow label="Receipt ID" value={receipt.receipt_id} />
                  <FieldRow label="SHA-256" value={receipt.digest} />
                  <FieldRow label="Ed25519 signature" value={receipt.signatures.ed25519} />
                  <FieldRow label="Public key" value={receipt.public_key} />
                  <FieldRow label="Timestamp (UTC)" value={receipt.timestamp} />
                  <FieldRow label="Canonicalisation" value={receipt.canonicalisation_method} />
                  <FieldRow label="Issuer" value={receipt.issuer} />
                  <FieldRow label="Protocol" value={receipt.protocol} />
                  <FieldRow
                    label="Predicates"
                    value={`${receipt.predicates.name} · ${formatBytes(receipt.predicates.size)} · ${receipt.predicates.mime}`}
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      downloadText(
                        `${receipt.receipt_id}.praman`,
                        `${JSON.stringify(receipt, null, 2)}\n`,
                      )
                    }
                    className="rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
                  >
                    Download .praman receipt
                  </button>
                  <button
                    type="button"
                    disabled={publishing || published}
                    onClick={() => void publish(receipt)}
                    className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                  >
                    {published
                      ? "Published to the ledger"
                      : publishing
                        ? "Publishing…"
                        : "Publish to the public ledger"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(canonicalise(receipt));
                      toast.success("Canonical receipt copied");
                    }}
                    className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Copy canonical JSON
                  </button>
                  {secretKeyHex ? (
                    <button
                      type="button"
                      onClick={() =>
                        downloadText(
                          `${receipt.receipt_id}.key.txt`,
                          `${secretKeyHex}\n`,
                          "text/plain",
                        )
                      }
                      className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Download signing key (optional)
                    </button>
                  ) : null}
                  <Link
                    to="/verify"
                    className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Verify it now
                  </Link>
                </div>

                <HonestyNote>
                  Integrity proven. Truth not verified. This receipt proves these exact bytes
                  existed in this form at the moment of sealing and have not changed since. It
                  makes no claim about whether the content is accurate, lawful or authored by
                  anyone in particular.
                </HonestyNote>
              </>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Nothing sealed yet. Choose a file or paste text, then seal. The result appears
                here and downloads as a <span className="font-mono text-gold">.praman</span> file
                containing the digest, the canonicalisation method, the timestamp, the issuer, the
                predicates, the verify URL and the Ed25519 signature.
              </p>
            )}
          </Panel>
        </div>
      </Section>
    </>
  );
}
