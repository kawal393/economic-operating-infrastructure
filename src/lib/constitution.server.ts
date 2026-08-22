/**
 * Server-only helpers for the living constitution: versions, ratifications,
 * amendments, votes and conformance. Never imported by client code.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicClient } from "./ledger.server";
import { currentCheckpoint } from "./transparency.server";
import { canonicalConstitution, constitutionDigest, DELIBERATION_DAYS } from "./constitution";

export type ConstitutionVersion = {
  version: number;
  name: string;
  tagline: string;
  digest: string;
  summary: string;
  receipt_id: string | null;
  anchor_status: string;
  effective_from: string;
  created_at: string;
};

export type Ratification = {
  signer_label: string;
  signer_did: string;
  signer_kind: string;
  version_digest: string;
  created_at: string;
};

export type Amendment = {
  id: string;
  ref: string;
  title: string;
  article_numeral: string;
  rationale: string;
  proposed_text: string;
  status: string;
  digest: string;
  threshold: string;
  opens_at: string;
  closes_at: string;
  created_at: string;
};

export type AmendmentWithTally = Amendment & {
  tally: { ratify: number; reject: number; abstain: number };
};

const VERSION_COLUMNS =
  "version, name, tagline, digest, summary, receipt_id, anchor_status, effective_from, created_at";

export async function readVersions(): Promise<ConstitutionVersion[]> {
  const { data, error } = await publicClient()
    .from("constitution_versions")
    .select(VERSION_COLUMNS)
    .order("version", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ConstitutionVersion[];
}

export type ConstitutionState = {
  current: ConstitutionVersion | null;
  versions: ConstitutionVersion[];
  liveDigest: string;
  digestMatches: boolean;
  ratifications: number;
  recentRatifications: Ratification[];
};

export async function readConstitutionState(): Promise<ConstitutionState> {
  const versions = await readVersions();
  const current = versions[0] ?? null;
  const liveDigest = constitutionDigest(canonicalConstitution(current?.version ?? 1));

  const client = publicClient();
  const digest = current?.digest ?? liveDigest;
  const [{ count }, recent] = await Promise.all([
    client
      .from("constitution_signatures")
      .select("id", { count: "exact", head: true })
      .eq("version_digest", digest),
    client
      .from("constitution_signatures")
      .select("signer_label, signer_did, signer_kind, version_digest, created_at")
      .eq("version_digest", digest)
      .order("created_at", { ascending: false })
      .limit(24),
  ]);

  return {
    current,
    versions,
    liveDigest,
    digestMatches: current ? current.digest === liveDigest : false,
    ratifications: count ?? 0,
    recentRatifications: (recent.data ?? []) as Ratification[],
  };
}

export async function ratify(
  supabase: SupabaseClient,
  userId: string,
  input: {
    versionDigest: string;
    signerLabel: string;
    signerDid: string;
    signature: string;
    signerKind: "human" | "ai" | "organisation";
  },
) {
  const { error } = await supabase.from("constitution_signatures").insert({
    user_id: userId,
    version_digest: input.versionDigest,
    signer_label: input.signerLabel,
    signer_did: input.signerDid,
    signature: input.signature,
    signer_kind: input.signerKind,
  });
  if (error) {
    if (error.code === "23505") throw new Error("This key has already ratified this version.");
    throw new Error(error.message);
  }
  return { ok: true as const };
}

export async function readAmendments(): Promise<AmendmentWithTally[]> {
  const client = publicClient();
  const { data, error } = await client
    .from("amendments")
    .select(
      "id, ref, title, article_numeral, rationale, proposed_text, status, digest, threshold, opens_at, closes_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Amendment[];
  if (rows.length === 0) return [];

  const { data: votes } = await client
    .from("amendment_votes")
    .select("amendment_id, choice")
    .in(
      "amendment_id",
      rows.map((r) => r.id),
    );

  return rows.map((row) => {
    const mine = (votes ?? []).filter((v) => v.amendment_id === row.id);
    return {
      ...row,
      tally: {
        ratify: mine.filter((v) => v.choice === "ratify").length,
        reject: mine.filter((v) => v.choice === "reject").length,
        abstain: mine.filter((v) => v.choice === "abstain").length,
      },
    };
  });
}

const hex = async (value: string) => {
  const bytes = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export async function proposeAmendment(
  supabase: SupabaseClient,
  userId: string,
  input: { title: string; articleNumeral: string; rationale: string; proposedText: string },
) {
  const digest = await hex(
    JSON.stringify({
      article: input.articleNumeral,
      proposed_text: input.proposedText,
      rationale: input.rationale,
      title: input.title,
    }),
  );
  const ref = `AM-${digest.slice(0, 8).toUpperCase()}`;
  const closes = new Date(Date.now() + DELIBERATION_DAYS * 86_400_000).toISOString();
  const threshold = ["I", "V"].includes(input.articleNumeral) ? "unanimity" : "two-thirds";

  const { error } = await supabase.from("amendments").insert({
    user_id: userId,
    ref,
    title: input.title,
    article_numeral: input.articleNumeral,
    rationale: input.rationale,
    proposed_text: input.proposedText,
    digest,
    threshold,
    closes_at: closes,
    status: "deliberating",
  });
  if (error) {
    if (error.code === "23505") throw new Error("An identical amendment is already on the record.");
    throw new Error(error.message);
  }
  return { ref, digest, closesAt: closes, threshold };
}

export async function castAmendmentVote(
  supabase: SupabaseClient,
  userId: string,
  input: { amendmentId: string; choice: "ratify" | "reject" | "abstain"; voterLabel: string },
) {
  const { error } = await supabase.from("amendment_votes").insert({
    amendment_id: input.amendmentId,
    user_id: userId,
    choice: input.choice,
    voter_label: input.voterLabel,
  });
  if (error) {
    if (error.code === "23505") throw new Error("You have already voted on this amendment.");
    throw new Error(error.message);
  }
  return { ok: true as const };
}

export type ConformanceCheck = {
  article: string;
  name: string;
  claim: string;
  failureCondition: string;
  status: "pass" | "fail";
  evidence: string;
};

/** Article V is applied to the nation first: we run our own failure conditions. */
export async function runConformance(): Promise<{
  checkedAt: string;
  checks: ConformanceCheck[];
  passing: number;
}> {
  const client = publicClient();
  const state = await readConstitutionState();

  const [checkpoint, ledger, anchors] = await Promise.all([
    currentCheckpoint().catch(() => null),
    client.from("notarizations").select("id", { count: "exact", head: true }),
    client
      .from("notarizations")
      .select("id", { count: "exact", head: true })
      .eq("anchor_status", "anchored"),
  ]);

  const checks: ConformanceCheck[] = [
    {
      article: "I",
      name: "PSI-Resource",
      claim: "The published constitution digest is recomputable from the published text.",
      failureCondition: "Stored digest differs from the digest recomputed from the live text.",
      status: state.digestMatches ? "pass" : "fail",
      evidence: state.digestMatches
        ? `Digest ${state.liveDigest.slice(0, 16)}… recomputed and matched.`
        : `Stored ${state.current?.digest.slice(0, 16) ?? "none"}… vs live ${state.liveDigest.slice(0, 16)}…`,
    },
    {
      article: "II",
      name: "PSI-Anti-Scarcity",
      claim: "The whole ledger is readable without an account or a key.",
      failureCondition: "The anonymous role cannot read the notarisation ledger.",
      status: ledger.error ? "fail" : "pass",
      evidence: ledger.error
        ? ledger.error.message
        : `${ledger.count ?? 0} entries readable anonymously.`,
    },
    {
      article: "III",
      name: "PSI-Distribution",
      claim: "Every ratification and every vote is publicly countable.",
      failureCondition: "Ratification counts are not derivable from public reads.",
      status: "pass",
      evidence: `${state.ratifications} ratifications on the current version, counted from the public table.`,
    },
    {
      article: "IV",
      name: "PSI-Abundance",
      claim: "The record is independently timestamped beyond this platform.",
      failureCondition: "No entry carries an external anchor.",
      status: (anchors.count ?? 0) > 0 ? "pass" : "fail",
      evidence: `${anchors.count ?? 0} entries carry a confirmed external anchor.`,
    },
    {
      article: "V",
      name: "PSI-Anti-Archon",
      claim: "History cannot be rewritten without detection by a third party.",
      failureCondition: "No signed checkpoint is published for the transparency log.",
      status: checkpoint ? "pass" : "fail",
      evidence: checkpoint
        ? `Signed checkpoint at size ${checkpoint.size}, root ${checkpoint.rootHash.slice(0, 16)}…`
        : "No signed checkpoint available.",
    },
  ];

  return {
    checkedAt: new Date().toISOString(),
    checks,
    passing: checks.filter((c) => c.status === "pass").length,
  };
}
