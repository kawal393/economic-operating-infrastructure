/**
 * MINISTER — server-only government agent runtime.
 * Provisions the ElevenLabs realtime agent, mints conversation tokens, and
 * executes the delegated powers under Sentinel supervision.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import { ARTICLES } from "@/content/nation";
import { GOV_TOOLS, MINISTER_SYSTEM_PROMPT, ministerFirstMessage } from "./gov-tools";
import { publicClient, readStats } from "./ledger.server";
import {
  consumeRateLimit,
  inspect,
  logSecurityEvent,
  readFlags,
  readThreatSummary,
  sanitiseText,
  writeFlag,
} from "./security.server";

const EL_API = "https://api.elevenlabs.io/v1";

function apiKey(): string {
  const key = process.env["ELEVENLABS_API_KEY"];
  if (!key) throw new Error("The voice ministry is not provisioned on this deployment.");
  return key;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/* -------------------------------------------------------- agent provisioning */

function conversationConfig() {
  return {
    agent: {
      first_message: ministerFirstMessage(),
      language: "en",
      prompt: {
        prompt: MINISTER_SYSTEM_PROMPT,
        llm: "gemini-2.5-flash",
        temperature: 0.3,
        tools: GOV_TOOLS.map((tool) => ({
          type: "client",
          name: tool.name,
          description: tool.description,
          expects_response: true,
          response_timeout_secs: 15,
          parameters: {
            type: "object",
            properties: Object.fromEntries(
              tool.params.map((p) => [p.name, { type: "string", description: p.description }]),
            ),
            required: tool.params.filter((p) => p.required).map((p) => p.name),
          },
        })),
      },
    },
    tts: { model_id: "eleven_turbo_v2" },
    turn: { turn_timeout: 10 },
  };
}

async function createMinisterAgent(): Promise<string> {
  const response = await fetch(`${EL_API}/convai/agents/create`, {
    method: "POST",
    headers: { "xi-api-key": apiKey(), "content-type": "application/json" },
    body: JSON.stringify({
      name: "Minister of State — Sovereign AI Services",
      conversation_config: conversationConfig(),
    }),
  });
  const body = await response.text();
  if (!response.ok) {
    console.error(`[minister] agent create failed [${response.status}]: ${body}`);
    throw new Error(`Voice ministry provisioning failed [${response.status}]`);
  }
  const parsed = JSON.parse(body) as { agent_id: string };
  await writeFlag("minister_agent_id", { id: parsed.agent_id });
  return parsed.agent_id;
}

async function ensureMinisterAgent(): Promise<string> {
  const flags = await readFlags();
  if (flags.ministerAgentId) return flags.ministerAgentId;
  return createMinisterAgent();
}

export type VoiceGrant =
  | { ok: true; token: string; agentId: string; sessionId: string }
  | { ok: false; reason: string };

export async function mintVoiceGrant(input: {
  userId: string | null;
  fingerprint: string;
}): Promise<VoiceGrant> {
  const flags = await readFlags();
  if (!flags.agentEnabled) {
    return { ok: false, reason: "The Minister is currently offline by order of the Sentinel." };
  }

  const allowed = await consumeRateLimit(`voice:${input.userId ?? input.fingerprint}`, 8, 3600);
  if (!allowed) {
    await logSecurityEvent({
      kind: "rate_limit",
      severity: "low",
      source: "minister",
      actor: input.userId,
      fingerprint: input.fingerprint,
      detail: { bucket: "voice" },
    });
    return { ok: false, reason: "Session quota reached. Try again within the hour." };
  }

  const agentId = await ensureMinisterAgent();
  const response = await fetch(
    `${EL_API}/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`,
    { headers: { "xi-api-key": apiKey() } },
  );
  const body = await response.text();
  if (!response.ok) {
    console.error(`[minister] token failed [${response.status}]: ${body}`);
    return { ok: false, reason: `The voice channel refused the handshake [${response.status}].` };
  }
  const { token } = JSON.parse(body) as { token: string };

  const db = await admin();
  const { data: session } = await db
    .from("agent_sessions")
    .insert({ channel: "voice", user_id: input.userId })
    .select("id")
    .single();

  return { ok: true, token, agentId, sessionId: session?.id ?? "" };
}

/* ------------------------------------------------------------- tool runtime */

export type ToolOutcome = {
  status: "ok" | "denied" | "needs_approval" | "error";
  message: string;
  data?: Json;
};

/** All tool payloads cross the RPC boundary as JSON. */
function payload(value: unknown): Json {
  return JSON.parse(JSON.stringify(value ?? null)) as Json;
}

const TOOL_MAP = new Map(GOV_TOOLS.map((t) => [t.name, t]));

async function recordAction(input: {
  sessionId: string | null;
  userId: string | null;
  tool: string;
  args: Record<string, string>;
  status: string;
  summary: string;
  requiresApproval: boolean;
}) {
  try {
    const db = await admin();
    await db.from("agent_actions").insert({
      session_id: input.sessionId || null,
      user_id: input.userId,
      tool: input.tool,
      input: input.args as unknown as Json,
      status: input.status,
      summary: input.summary.slice(0, 400),
      requires_approval: input.requiresApproval,
    });
  } catch (error) {
    console.error("[minister] failed to record action", error);
  }
}

export async function executeGovTool(input: {
  tool: string;
  args: Record<string, string>;
  approved: boolean;
  sessionId: string | null;
  userId: string | null;
  supabase: SupabaseClient<Database> | null;
  fingerprint: string;
}): Promise<ToolOutcome> {
  const tool = TOOL_MAP.get(input.tool);
  if (!tool) {
    await logSecurityEvent({
      kind: "unknown_tool",
      severity: "medium",
      source: "minister",
      actor: input.userId,
      fingerprint: input.fingerprint,
      detail: { tool: input.tool.slice(0, 64) },
    });
    return { status: "denied", message: "No such delegated power exists." };
  }

  // 1. Sanitise and inspect every argument before it reaches the nation.
  const args: Record<string, string> = {};
  for (const [key, raw] of Object.entries(input.args ?? {})) {
    const clean = sanitiseText(String(raw ?? ""), 2000);
    const verdict = inspect(clean);
    if (!verdict.safe) {
      await logSecurityEvent({
        kind: "prompt_injection",
        severity: verdict.worst,
        source: "minister",
        actor: input.userId,
        fingerprint: input.fingerprint,
        detail: { tool: tool.name, field: key, patterns: verdict.matches.map((m) => m.id) },
      });
      return {
        status: "denied",
        message:
          "That input matched the Sentinel's injection signatures. The attempt has been logged and refused.",
      };
    }
    args[key] = clean;
  }

  // 2. Rate limit per actor.
  const ok = await consumeRateLimit(
    `tool:${input.userId ?? input.fingerprint}`,
    tool.write ? 20 : 120,
    300,
  );
  if (!ok) {
    await logSecurityEvent({
      kind: "rate_limit",
      severity: "low",
      source: "minister",
      actor: input.userId,
      fingerprint: input.fingerprint,
      detail: { tool: tool.name },
    });
    return { status: "denied", message: "Rate limit reached. The Minister is pausing this channel." };
  }

  // 3. Write-path gates: posture, kill switch, authentication, explicit approval.
  if (tool.write) {
    const flags = await readFlags();
    if (flags.posture === "LOCKDOWN" || !flags.agentWriteEnabled) {
      await recordAction({ ...input, args, status: "denied", summary: "Blocked by defence posture", requiresApproval: true });
      return {
        status: "denied",
        message: "Governance writes are suspended while the nation is in lockdown.",
      };
    }
    if (!input.userId || !input.supabase) {
      return {
        status: "denied",
        message: "That action changes the record. Sign in as a citizen first.",
      };
    }
    if (!input.approved) {
      await recordAction({ ...input, args, status: "pending", summary: `Awaiting approval: ${tool.label}`, requiresApproval: true });
      return {
        status: "needs_approval",
        message: `${tool.label} requires your explicit approval before it is recorded.`,
        data: payload({ tool: tool.name, args }),
      };
    }
  }

  try {
    const result = await runTool(tool.name, args, input.supabase, input.userId);
    await recordAction({
      ...input,
      args,
      status: result.status,
      summary: result.message,
      requiresApproval: tool.write,
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown failure";
    await recordAction({ ...input, args, status: "error", summary: message, requiresApproval: tool.write });
    return { status: "error", message };
  }
}

async function runTool(
  name: string,
  args: Record<string, string>,
  db: SupabaseClient<Database> | null,
  userId: string | null,
): Promise<ToolOutcome> {
  switch (name) {
    case "nation_stats": {
      const stats = await readStats();
      const pub = publicClient();
      const [citizens, states, entities] = await Promise.all([
        pub.from("citizens").select("id", { count: "exact", head: true }),
        pub.from("nation_states").select("id", { count: "exact", head: true }),
        pub.from("entities").select("id", { count: "exact", head: true }),
      ]);
      const data = {
        notarizations: stats.entries,
        chain_head: stats.head?.slice(0, 12) ?? null,
        citizens: citizens.count ?? stats.citizens,
        nation_states: states.count ?? stats.nationStates,
        registered_entities: entities.count ?? 0,
        pricing: "free — the platform charges nothing and has no fee schedule",
      };
      return {
        status: "ok",
        message: `${data.notarizations} ledger entries, ${data.citizens} members, ${data.nation_states} workspaces, ${data.registered_entities} registered entities.`,
        data: payload(data),
      };
    }

    case "ledger_lookup": {
      const ref = (args["reference"] ?? "").toLowerCase();
      const pub = publicClient();
      const query = /^[0-9a-f]{64}$/.test(ref)
        ? pub.from("notarizations").select("*").eq("content_hash", ref)
        : pub.from("notarizations").select("*").eq("receipt_id", ref);
      const { data } = await query.limit(5);
      if (!data?.length) {
        return { status: "ok", message: "No entry on the ledger matches that reference.", data: [] };
      }
      return {
        status: "ok",
        message: `${data.length} matching ledger ${data.length === 1 ? "entry" : "entries"} found.`,
        data: payload(data),
      };
    }

    case "registry_lookup": {
      const q = args["query"] ?? "";
      const { data } = await publicClient()
        .from("entities")
        .select("name, slug, kind, domain, seal_status, domain_verified_at")
        .or(`name.ilike.%${q.replace(/[%,()]/g, "")}%,domain.ilike.%${q.replace(/[%,()]/g, "")}%`)
        .limit(8);
      return {
        status: "ok",
        message: data?.length
          ? `${data.length} registry ${data.length === 1 ? "match" : "matches"}.`
          : "No entity in the registry matches. Absence is itself a signal.",
        data: payload(data ?? []),
      };
    }

    case "governance_brief": {
      const { data } = await publicClient()
        .from("governance_proposals")
        .select("id, title, description, status, votes_for, votes_against, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(10);
      return {
        status: "ok",
        message: data?.length
          ? `${data.length} active ${data.length === 1 ? "proposal" : "proposals"} before the legislature.`
          : "No proposals are currently active.",
        data: payload(data ?? []),
      };
    }

    case "explain_article": {
      const needle = (args["article"] ?? "").trim().toLowerCase();
      const article =
        ARTICLES.find((a) => a.numeral.toLowerCase() === needle) ??
        ARTICLES.find((a) => a.name.toLowerCase().includes(needle) || a.slug === needle) ??
        null;
      if (!article) {
        return { status: "ok", message: "There are five articles, numbered I through V.", data: null };
      }
      return {
        status: "ok",
        message: `Article ${article.numeral} — ${article.name}: ${article.right}. ${article.thesis}`,
        data: payload(article),
      };
    }

    case "security_posture": {
      const summary = await readThreatSummary(false);
      return {
        status: "ok",
        message: `Posture ${summary.posture}. ${summary.blocked24h} attempts blocked in the last 24 hours. Agent ${summary.agentEnabled ? "online" : "offline"}, writes ${summary.agentWriteEnabled ? "enabled" : "suspended"}.`,
        data: payload(summary),
      };
    }

    case "open_console": {
      const path = args["path"] ?? "/";
      return { status: "ok", message: `Opening ${path}.`, data: payload({ path }) };
    }

    case "file_proposal": {
      if (!db || !userId) return { status: "denied", message: "Sign in required." };
      const citizenId = await citizenIdFor(db, userId);
      const { data, error } = await db
        .from("governance_proposals")
        .insert({
          title: args["title"] ?? "Untitled proposal",
          description: args["description"] ?? "",
          proposer_id: citizenId,
          status: "active",
        })
        .select("id, title")
        .single();
      if (error) return { status: "error", message: error.message };
      return { status: "ok", message: `Proposal filed: "${data.title}".`, data: payload(data) };
    }

    case "cast_vote": {
      if (!db || !userId) return { status: "denied", message: "Sign in required." };
      const citizenId = await citizenIdFor(db, userId);
      if (!citizenId) {
        return { status: "denied", message: "Only registered citizens may vote. Register first." };
      }
      const vote = (args["vote"] ?? "").toLowerCase().startsWith("a") ? "against" : "for";
      const { error } = await db
        .from("votes")
        .insert({ proposal_id: args["proposal_id"] ?? "", vote, voter_id: citizenId });
      if (error) return { status: "error", message: error.message };
      return { status: "ok", message: `Vote recorded: ${vote}.`, data: payload({ vote }) };
    }

    case "register_entity": {
      if (!db || !userId) return { status: "denied", message: "Sign in required." };
      const { registerEntity } = await import("./entities.server");
      const kinds = ["company", "ai_system", "agent", "model", "dataset", "institution"] as const;
      const kind = kinds.includes(args["kind"] as (typeof kinds)[number])
        ? (args["kind"] as (typeof kinds)[number])
        : "company";
      const result = await registerEntity(db, userId, {
        name: args["name"] ?? "Unnamed entity",
        kind,
        domain: args["domain"] || null,
        description: null,
        claimAsMine: true,
      });
      return { status: "ok", message: `Entity registered in the public registry.`, data: payload(result) };
    }

    default:
      return { status: "denied", message: "That power is not delegated." };
  }
}

async function citizenIdFor(db: SupabaseClient<Database>, userId: string) {
  const { data } = await db.from("citizens").select("id").eq("user_id", userId).maybeSingle();
  return data?.id ?? null;
}

/* --------------------------------------------------------------- text channel */

export async function openTextSession(userId: string | null): Promise<string> {
  const db = await admin();
  const { data } = await db
    .from("agent_sessions")
    .insert({ channel: "text", user_id: userId })
    .select("id")
    .single();
  return data?.id ?? "";
}
