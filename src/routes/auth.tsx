import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { KeyRound, LogIn, UserPlus } from "lucide-react";
import { PageHeader, Panel, Section } from "@/components/primitives";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign In — Member Credentials | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Sign in or create a member account for the workspace. Accounts are required only to bind a registry membership record; sealing and verification stay free and keyless.",
      },
      { property: "og:title", content: "Member Credentials" },
      {
        property: "og:description",
        content: "Sign in to register registry membership, deploy a workspace and anchor to Bitcoin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const destination = search.redirect && search.redirect.startsWith("/") ? search.redirect : "/dashboard";

  useEffect(() => {
    if (!loading && user) navigate({ to: destination });
  }, [loading, user, destination, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("Account created", { description: "You are signed in as a prospective member." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast.success("Signed in");
      }
      navigate({ to: destination });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Credentials"
        title="An account binds a registry membership record. It does not gate the mathematics."
        description="Sealing, verifying and reading the ledger require no account and never will. An account exists only so a registry membership record, a workspace and its anchors can be attributed to you."
      />

      <Section>
        <div className="mx-auto max-w-md">
          <Panel className="p-7">
            <div className="mb-6 flex gap-2 rounded-md border border-border p-1">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
                    mode === m ? "bg-gold/15 text-gold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "signin" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted-foreground">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/50"
                  placeholder="member@example.com"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted-foreground">Password</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/50"
                  placeholder="At least 8 characters"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {mode === "signin" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
              <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
              Your signing keys are generated in your browser and never transmitted. This account holds
              identity, not authority.
            </p>
          </Panel>
        </div>
      </Section>
    </>
  );
}
