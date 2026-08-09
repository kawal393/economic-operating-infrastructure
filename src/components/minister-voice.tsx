import { useCallback, useMemo, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Panel, StatusDot } from "@/components/primitives";
import { GOV_TOOLS } from "@/lib/gov-tools";
import {
  grantPublicVoiceSession,
  grantVoiceSession,
  reportTranscript,
  runCitizenTool,
  runPublicTool,
} from "@/lib/gov-agent.functions";
import { useAuth } from "@/hooks/useAuth";

type Line = { who: "citizen" | "minister" | "sentinel"; text: string; at: number };
type Pending = { id: string; tool: string; args: Record<string, string>; label: string };

export default function MinisterVoice({ online }: { online: boolean }) {
  return (
    <ConversationProvider>
      <MinisterConsole online={online} />
    </ConversationProvider>
  );
}

function MinisterConsole({ online }: { online: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const grantAuthed = useServerFn(grantVoiceSession);
  const grantPublic = useServerFn(grantPublicVoiceSession);
  const citizenTool = useServerFn(runCitizenTool);
  const publicTool = useServerFn(runPublicTool);
  const report = useServerFn(reportTranscript);

  const [lines, setLines] = useState<Line[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<string | null>(null);
  const signedIn = Boolean(user);

  const push = useCallback((who: Line["who"], text: string) => {
    setLines((prev) => [...prev.slice(-60), { who, text, at: Date.now() }]);
  }, []);

  const invoke = useCallback(
    async (tool: string, args: Record<string, string>, approved: boolean) => {
      const payload = { data: { tool, args, approved, sessionId: sessionRef.current } };
      return signedIn ? citizenTool(payload) : publicTool(payload);
    },
    [signedIn, citizenTool, publicTool],
  );

  const clientTools = useMemo(() => {
    const map: Record<string, (params: Record<string, string>) => Promise<string> | string> = {};
    for (const tool of GOV_TOOLS) {
      map[tool.name] = async (params) => {
        if (tool.name === "open_console") {
          const path = String(params?.["path"] ?? "/");
          if (/^\/[a-z0-9/_-]*$/i.test(path)) {
            void navigate({ to: path });
            push("sentinel", `Navigated to ${path}`);
            return `Opened ${path}.`;
          }
          return "Refused: that path is not part of the nation.";
        }
        const result = await invoke(tool.name, (params ?? {}) as Record<string, string>, false);
        if (result.status === "needs_approval") {
          const entry: Pending = {
            id: `${tool.name}-${Date.now()}`,
            tool: tool.name,
            args: (params ?? {}) as Record<string, string>,
            label: tool.label,
          };
          setPending((prev) => [...prev, entry]);
          push("sentinel", `Approval required — ${tool.label}`);
          return "Awaiting the citizen's on-screen approval. Ask them to confirm.";
        }
        if (result.status !== "ok") {
          push("sentinel", result.message);
          return `Refused: ${result.message}`;
        }
        push("sentinel", `${tool.label} → ${result.message}`);
        return JSON.stringify({ summary: result.message, data: result.data ?? null });
      };
    }
    return map;
  }, [invoke, navigate, push]);

  const conversation = useConversation({
    clientTools,
    onConnect: () => push("sentinel", "Secure channel open. Minister of State is listening."),
    onDisconnect: () => push("sentinel", "Channel closed."),
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      toast.error("Voice channel error", { description: message });
    },
    onMessage: (message: { message?: string; source?: string }) => {
      const text = message?.message;
      if (!text) return;
      const who = message.source === "user" ? "citizen" : "minister";
      push(who, text);
      if (who === "citizen") void report({ data: { text, sessionId: sessionRef.current } });
    },
  });

  const status = conversation.status;
  const live = status === "connected";

  async function start() {
    setError(null);
    setConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const grant = signedIn ? await grantAuthed() : await grantPublic();
      if (!grant.ok) {
        setError(grant.reason);
        toast.error(grant.reason);
        return;
      }
      sessionRef.current = grant.sessionId || null;
      conversation.startSession({
        conversationToken: grant.token,
        connectionType: "webrtc",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to open the voice channel.";
      setError(message);
      toast.error(message);
    } finally {
      setConnecting(false);
    }
  }

  async function approve(entry: Pending) {
    const result = await invoke(entry.tool, entry.args, true);
    setPending((prev) => prev.filter((p) => p.id !== entry.id));
    push("sentinel", `${entry.label} → ${result.message}`);
    if (result.status === "ok") toast.success(result.message);
    else toast.error(result.message);
    if (live) conversation.sendContextualUpdate?.(`Citizen decision: ${result.message}`);
  }

  function deny(entry: Pending) {
    setPending((prev) => prev.filter((p) => p.id !== entry.id));
    push("sentinel", `${entry.label} → refused by the citizen.`);
    if (live) conversation.sendContextualUpdate?.("Citizen refused the action. Do not retry it.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Panel className="flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <StatusDot active={live} />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {live ? (conversation.isSpeaking ? "Minister speaking" : "Minister listening") : status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {live ? (
              <button
                onClick={() => void conversation.endSession()}
                className="rounded-md border border-border px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-danger/60 hover:text-danger"
              >
                End audience
              </button>
            ) : (
              <button
                onClick={() => void start()}
                disabled={connecting || !online}
                className="rounded-md bg-gold px-4 py-2 text-xs font-semibold text-background transition-opacity disabled:opacity-40"
              >
                {connecting ? "Opening channel…" : "Request an audience"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 min-h-[22rem] flex-1 space-y-3 overflow-y-auto pr-1">
          {lines.length === 0 ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              The Minister of State speaks for the government of the digital nation-state. Every
              claim it makes is fetched from the live ledger — it is architecturally unable to
              invent a statistic. Ask it for the state of the nation, a receipt, an article of the
              constitution, or the defence posture.
            </p>
          ) : (
            lines.map((line) => (
              <div key={`${line.at}-${line.text.slice(0, 12)}`} className="text-sm leading-relaxed">
                <span
                  className={
                    line.who === "minister"
                      ? "font-mono text-[11px] uppercase tracking-[0.18em] text-gold"
                      : line.who === "citizen"
                        ? "font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                        : "font-mono text-[11px] uppercase tracking-[0.18em] text-success"
                  }
                >
                  {line.who}
                </span>
                <p className="mt-1 text-foreground/90">{line.text}</p>
              </div>
            ))
          )}
        </div>

        {error ? <p className="mt-4 font-mono text-xs text-danger">{error}</p> : null}
        {!signedIn ? (
          <p className="mt-4 border-t border-border/60 pt-4 font-mono text-[11px] text-muted-foreground">
            Anonymous audience: read-only powers. Sign in to delegate governance actions.
          </p>
        ) : null}
      </Panel>

      <div className="space-y-6">
        <Panel>
          <p className="eyebrow">Approval queue — Article III</p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">Nothing is recorded unbidden</h3>
          {pending.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No action is awaiting your authority. Every write the Minister proposes lands here
              first; authority is delegated, revocable and logged.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pending.map((entry) => (
                <li key={entry.id} className="rounded-md border border-gold/30 bg-gold/5 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
                    {entry.label}
                  </p>
                  <pre className="mt-2 overflow-x-auto font-mono text-[11px] text-muted-foreground">
                    {JSON.stringify(entry.args, null, 2)}
                  </pre>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => void approve(entry)}
                      className="rounded-md bg-gold px-3 py-1.5 text-xs font-semibold text-background"
                    >
                      Authorise
                    </button>
                    <button
                      onClick={() => deny(entry)}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                    >
                      Refuse
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <p className="eyebrow">Delegated powers</p>
          <ul className="mt-3 space-y-2.5">
            {GOV_TOOLS.map((tool) => (
              <li key={tool.name} className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-foreground">{tool.name}</p>
                  <p className="text-xs text-muted-foreground">{tool.label}</p>
                </div>
                <span
                  className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${
                    tool.write
                      ? "border-gold/40 text-gold"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {tool.write ? "write" : "read"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
