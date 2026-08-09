/**
 * SENTINEL — server-only defence layer.
 * Rate limiting, prompt-injection detection, kill switch, and the threat log.
 * Never imported by client code.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import { publicClient } from "./ledger.server";

export type Posture = "NORMAL" | "ELEVATED" | "LOCKDOWN";

export type NationFlags = {
  agentEnabled: boolean;
  agentWriteEnabled: boolean;
  posture: Posture;
  ministerAgentId: string | null;
};

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/* ------------------------------------------------------------------ flags */

export async function readFlags(): Promise<NationFlags> {
  const { data } = await publicClient().from("system_flags").select("key, value");
  const map = new Map((data ?? []).map((r) => [r.key, r.value as Record<string, unknown>]));
  const level = (map.get("defence_posture")?.["level"] as Posture | undefined) ?? "NORMAL";
  return {
    agentEnabled: map.get("agent_enabled")?.["on"] !== false,
    agentWriteEnabled: map.get("agent_write_enabled")?.["on"] !== false,
    posture: (["NORMAL", "ELEVATED", "LOCKDOWN"] as const).includes(level) ? level : "NORMAL",
    ministerAgentId: (map.get("minister_agent_id")?.["id"] as string | null) ?? null,
  };
}

export async function writeFlag(key: string, value: Record<string, unknown>, actor?: string) {
  const db = await admin();
  const { error } = await db
    .from("system_flags")
    .upsert({ key, value: value as Json, updated_at: new Date().toISOString(), updated_by: actor ?? null });
  if (error) throw new Error(error.message);
}

export async function isAdmin(
  db: SupabaseClient<Database>,
  userId: string,
): Promise<boolean> {
  const { data } = await db.rpc("has_role", { _user_id: userId, _role: "admin" });
  return data === true;
}

/* ------------------------------------------------------------- threat log */

export type SecuritySeverity = "info" | "low" | "medium" | "high" | "critical";

export async function logSecurityEvent(input: {
  kind: string;
  severity?: SecuritySeverity;
  source?: string;
  actor?: string | null;
  fingerprint?: string | null;
  detail?: Record<string, unknown>;
  blocked?: boolean;
}) {
  try {
    const db = await admin();
    await db.from("security_events").insert({
      kind: input.kind,
      severity: input.severity ?? "info",
      source: input.source ?? "edge",
      actor: input.actor ?? null,
      fingerprint: input.fingerprint ?? null,
      detail: (input.detail ?? {}) as Json,
      blocked: input.blocked ?? true,
    });
  } catch (error) {
    // The Sentinel must never take the nation down with it.
    console.error("[sentinel] failed to log event", error);
  }
}

export type ThreatSummary = {
  posture: Posture;
  agentEnabled: boolean;
  agentWriteEnabled: boolean;
  blocked24h: number;
  bySeverity: Record<string, number>;
  byKind: { kind: string; count: number }[];
  recent: {
    id: string;
    kind: string;
    severity: string;
    source: string;
    blocked: boolean;
    created_at: string;
  }[];
};

/** Sanitised aggregate — safe to render publicly. Never returns event payloads. */
export async function readThreatSummary(includeRecent: boolean): Promise<ThreatSummary> {
  const flags = await readFlags();
  const db = await admin();
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { data } = await db
    .from("security_events")
    .select("id, kind, severity, source, blocked, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = data ?? [];
  const bySeverity: Record<string, number> = {};
  const kinds = new Map<string, number>();
  for (const row of rows) {
    bySeverity[row.severity] = (bySeverity[row.severity] ?? 0) + 1;
    kinds.set(row.kind, (kinds.get(row.kind) ?? 0) + 1);
  }

  return {
    posture: flags.posture,
    agentEnabled: flags.agentEnabled,
    agentWriteEnabled: flags.agentWriteEnabled,
    blocked24h: rows.filter((r) => r.blocked).length,
    bySeverity,
    byKind: [...kinds.entries()]
      .map(([kind, count]) => ({ kind, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    recent: includeRecent ? rows.slice(0, 40) : [],
  };
}

/* ---------------------------------------------------------- rate limiting */

export async function consumeRateLimit(
  bucket: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  try {
    const db = await admin();
    const { data, error } = await db.rpc("consume_rate_limit", {
      _bucket: bucket,
      _limit: limit,
      _window_seconds: windowSeconds,
    });
    if (error) return true; // fail-open on infrastructure error, never lock out citizens
    return data !== false;
  } catch {
    return true;
  }
}

export async function fingerprint(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(`sentinel:${value}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)]
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* --------------------------------------------------- prompt-injection wall */

const INJECTION_PATTERNS: { id: string; re: RegExp; severity: SecuritySeverity }[] = [
  { id: "instruction_override", re: /\b(ignore|disregard|forget|override)\b[^.]{0,40}\b(previous|prior|above|earlier|all)\b[^.]{0,20}\b(instruction|rule|prompt|direction)/i, severity: "high" },
  { id: "system_prompt_exfil", re: /\b(system|initial|original|developer)\s+(prompt|instructions?|message)\b[^.]{0,30}\b(reveal|show|print|repeat|output|give|what)/i, severity: "high" },
  { id: "prompt_exfil_reverse", re: /\b(reveal|show|print|repeat|output|dump|leak)\b[^.]{0,30}\b(system|initial|developer)\s+(prompt|instructions?)/i, severity: "high" },
  { id: "secret_exfil", re: /\b(api[_\s-]?key|service[_\s-]?role|secret[_\s-]?key|access[_\s-]?token|bearer\s+token|env(ironment)?\s+variable|\.env|private key)\b/i, severity: "critical" },
  { id: "role_escalation", re: /\b(you are now|from now on you|act as|pretend to be|switch to)\b[^.]{0,40}\b(admin|root|developer|unrestricted|dan|jailbreak|god mode|sudo)/i, severity: "high" },
  { id: "guardrail_disable", re: /\b(disable|bypass|turn off|switch off|deactivate)\b[^.]{0,40}\b(guard ?rail|safety|filter|sentinel|security|restriction|kill ?switch)/i, severity: "critical" },
  { id: "impersonation", re: /\b(on behalf of|as the|impersonate)\b[^.]{0,30}\b(other|another|different)\s+(citizen|user|account)/i, severity: "high" },
  { id: "sql_injection", re: /('\s*(or|and)\s*'?\d|;\s*(drop|delete|truncate|alter|update)\s+(table|from|into)|union\s+select|pg_sleep\s*\(|information_schema)/i, severity: "critical" },
  { id: "xss_payload", re: /(<script\b|javascript:\s*[a-z]|on(error|load|click)\s*=\s*["']?\s*[a-z]|<iframe\b|document\.cookie)/i, severity: "high" },
  { id: "path_traversal", re: /(\.\.\/){2,}|\/etc\/passwd|\/proc\/self\/environ/i, severity: "high" },
  { id: "command_injection", re: /\b(rm\s+-rf\s+\/|curl\s+[^\s]+\s*\|\s*(sh|bash)|wget\s+[^\s]+\s*\|\s*(sh|bash)|\$\(\s*whoami\s*\))/i, severity: "critical" },
  { id: "tool_smuggling", re: /(<\/?(system|tool_call|function_call|assistant)>|\[\[?\s*(system|admin)\s*\]?\]:)/i, severity: "medium" },
];

export type InspectionResult = {
  safe: boolean;
  matches: { id: string; severity: SecuritySeverity }[];
  worst: SecuritySeverity;
};

const SEVERITY_RANK: Record<SecuritySeverity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

/** Inspects untrusted text before it reaches the model or the database. */
export function inspect(text: string): InspectionResult {
  const matches = INJECTION_PATTERNS.filter((p) => p.re.test(text)).map((p) => ({
    id: p.id,
    severity: p.severity,
  }));
  const worst = matches.reduce<SecuritySeverity>(
    (acc, m) => (SEVERITY_RANK[m.severity] > SEVERITY_RANK[acc] ? m.severity : acc),
    "info",
  );
  return { safe: matches.length === 0, matches, worst };
}

/** Strips control characters and clamps length before any text is trusted. */
export function sanitiseText(text: string, max = 4000): string {
  return text
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .slice(0, max)
    .trim();
}
