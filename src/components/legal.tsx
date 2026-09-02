import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { DISCLAIMER } from "@/content/legal";
import { cn } from "@/lib/utils";

/** Permanent, non-dismissible legal fence. Rendered in the footer of every page. */
export function LegalDisclaimer({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-md border border-border bg-secondary/30 px-4 py-4", className)}>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Legal notice
      </p>
      <p className="mt-2 max-w-4xl text-xs leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
      <div className="mt-3 flex flex-wrap gap-4">
        <Link to="/terms" className="text-xs text-gold hover:underline">
          Terms of Service
        </Link>
        <Link to="/privacy" className="text-xs text-gold hover:underline">
          Privacy Policy
        </Link>
        <a href="/LICENSE.txt" className="text-xs text-gold hover:underline">
          Licence (all rights reserved, two carve-outs)
        </a>
        <a href="/NOTICE.txt" className="text-xs text-gold hover:underline">
          Third-party notices
        </a>
      </div>
      <p className="mt-3 max-w-4xl text-xs leading-relaxed text-muted-foreground">
        The source code of this site is not open source. Everything under /api/public/, the
        machine-readable documents and the offline verifier may be mirrored and redistributed
        commercially with no account; the source code is not licensed to copy. Terms clauses 10 to
        12 set this out in full.
      </p>
    </div>
  );
}

const STORAGE_KEY = "sas-disclaimer-ack-v1";

/** First-visit dismissible notice. Client-only; acknowledgement is stored locally. */
export function DisclaimerGate() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage unavailable — notice reappears next visit */
    }
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4">
      <div className="mx-auto max-w-3xl rounded-lg border border-gold/30 bg-background/95 p-5 shadow-[var(--glow-gold)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
            Before you continue
          </p>
          <button
            type="button"
            aria-label="Dismiss notice"
            onClick={dismiss}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-medium text-gold transition-colors hover:bg-gold/20"
          >
            I understand
          </button>
          <Link to="/terms" className="text-xs text-muted-foreground hover:text-gold">
            Read the Terms
          </Link>
        </div>
      </div>
    </div>
  );
}
