import { useCallback, useRef, useState, type DragEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/apex-psi";

export function DropZone({
  label,
  hint,
  file,
  onFile,
  accept,
}: {
  label: string;
  hint: string;
  file: File | null;
  onFile: (file: File | null) => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setOver(false);
      const dropped = event.dataTransfer.files?.[0];
      if (dropped) onFile(dropped);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 px-6 py-10 text-center transition-colors",
        over && "border-gold/60 bg-gold/5",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <>
          <p className="font-mono text-sm text-gold break-all">{file.name}</p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {formatBytes(file.size)} · {file.type || "application/octet-stream"}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFile(null);
            }}
            className="mt-4 rounded-md border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear
          </button>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">{hint}</p>
        </>
      )}
    </div>
  );
}

export function FieldRow({
  label,
  value,
  mono = true,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  tone?: "default" | "success" | "danger" | "warning";
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "text-sm break-all sm:max-w-[68%] sm:text-right",
          mono && "font-mono text-xs",
          tone === "default" && "text-foreground",
          tone === "success" && "text-success",
          tone === "danger" && "text-destructive",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function HonestyNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 rounded-md border border-warning/25 bg-warning/5 px-4 py-3 text-xs leading-relaxed text-warning">
      {children}
    </p>
  );
}

export function TabSwitch<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-border bg-secondary/40 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors",
            value === option.value
              ? "bg-gold/15 text-gold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
