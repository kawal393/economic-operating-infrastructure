import { ExternalLink } from "lucide-react";
import { Panel, Section, SectionHeading } from "@/components/primitives";
import { APEX_PORTAL, FOUNDING_SEALS } from "@/content/legal";

export function FoundingSeals() {
  return (
    <Section>
      <SectionHeading
        eyebrow="On the ledger"
        title="Founding Seals"
        description="The first records written into the APEX PSI ledger by this platform. Each one is a SHA-256 digest with a public receipt — recompute it, or verify it on the portal."
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {FOUNDING_SEALS.map((seal) => (
          <Panel key={seal.receiptId} interactive className="flex flex-col">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold">
              {seal.receiptId}
            </p>
            <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground">
              {seal.title}
            </h3>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              SHA-256
            </p>
            <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-foreground/80">
              {seal.hash}
            </p>
            <p className="mt-4 font-mono text-[11px] text-muted-foreground">{seal.timestamp}</p>
            <a
              href={`${APEX_PORTAL}/verify?hash=${seal.hash}`}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:underline"
            >
              Verify
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Panel>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href={`${APEX_PORTAL}/enforcement-watch`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-gold"
        >
          Article 50 Enforcement Watch <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <a
          href={`${APEX_PORTAL}/sealed-memory`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-gold"
        >
          Sealed Memory demo <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </Section>
  );
}
