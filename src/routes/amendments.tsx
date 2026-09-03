import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Check, Minus, X } from "lucide-react";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { getAmendments, submitAmendment, voteOnAmendment } from "@/lib/constitution.functions";
import { AMENDMENT_THRESHOLDS, DELIBERATION_DAYS } from "@/lib/constitution";
import { useAuth } from "@/hooks/useAuth";
import { ARTICLES } from "@/content/nation";

export const Route = createFileRoute("/amendments")({
  head: () => ({
    meta: [
      { title: "Amendments — Updating the Protocol Charter of the AI Era | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Propose, deliberate and vote on amendments to the Protocol Charter of the AI Era. Every proposal is sealed on submission and stays on the record, whether it passes or fails.",
      },
      { property: "og:title", content: "Amendments — The door marked 'updated forever'" },
      {
        property: "og:description",
        content:
          "Open amendment proposals, a fourteen-day deliberation window, and a permanent record of every failure.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/amendments" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/amendments" }],
  }),
  component: AmendmentsPage,
});

function AmendmentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const listFn = useServerFn(getAmendments);
  const proposeFn = useServerFn(submitAmendment);
  const voteFn = useServerFn(voteOnAmendment);

  const [title, setTitle] = useState("");
  const [numeral, setNumeral] = useState<"I" | "II" | "III" | "IV" | "V">("II");
  const [rationale, setRationale] = useState("");
  const [proposedText, setProposedText] = useState("");

  const amendments = useQuery({ queryKey: ["amendments"], queryFn: () => listFn() });

  const propose = useMutation({
    mutationFn: () =>
      proposeFn({ data: { title, articleNumeral: numeral, rationale, proposedText } }),
    onSuccess: (result) => {
      toast.success(`Amendment ${result.ref} sealed`, {
        description: `Deliberation closes ${new Date(result.closesAt).toLocaleDateString()}. Threshold: ${result.threshold}.`,
      });
      setTitle("");
      setRationale("");
      setProposedText("");
      queryClient.invalidateQueries({ queryKey: ["amendments"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const vote = useMutation({
    mutationFn: (input: { amendmentId: string; choice: "ratify" | "reject" | "abstain" }) =>
      voteFn({
        data: {
          ...input,
          voterLabel: user?.email?.split("@")[0] ?? "Member",
        },
      }),
    onSuccess: () => {
      toast.success("Vote recorded on the public record");
      queryClient.invalidateQueries({ queryKey: ["amendments"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = amendments.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Article VII · Amendment"
        title="A Charter is only written once — but it can be updated forever."
        description={`Anyone may draft an amendment. It is sealed the moment it is submitted, deliberated for ${DELIBERATION_DAYS} days, and either merged into a new sealed version or recorded as failed. Failed amendments are never deleted.`}
      >
        <Link
          to="/charter"
          className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
        >
          Read the current text
        </Link>
      </PageHeader>

      <Section className="py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Deliberation window",
              value: `${DELIBERATION_DAYS} days`,
              note: "No amendment can be rushed through in a news cycle.",
            },
            {
              label: "Articles II, III, IV",
              value: "Two-thirds",
              note: "Amendable by two-thirds of ratifying members.",
            },
            {
              label: "Articles I and V",
              value: "Unanimity",
              note: "Verified reality and a privately-unalterable record are not majority preferences.",
            },
          ].map((s) => (
            <Panel key={s.label} className="p-6">
              <p className="eyebrow">{s.label}</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-gold">{s.value}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.note}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="The record"
          title="Proposals on the floor"
          description="Sealed on submission. Tallies computed from public votes. Nothing here can be withdrawn."
        />

        <Panel className="mt-8 border-gold/40 p-7">
          <p className="eyebrow">Correction · COR-FEES-WITHDRAWN · Pricing · 3 September 2026</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            All paid tiers, subscriptions and the published metered fee schedule were withdrawn from
            this platform on 3 September 2026, together with the revenue scale model derived from
            them. No charge was ever made under any of them: no payment processor was ever
            connected. Sealing, verification, Bitcoin anchoring and reading the public ledger are
            free, keyless and need no account. No price is published anywhere on this site. This
            entry is appended, not substituted: no earlier amendment, charter version or ledger
            entry has been altered or removed, and Article III remains sealed charter text unchanged
            by this correction.
          </p>
        </Panel>

        <Panel className="mt-4 p-7">
          <p className="eyebrow">Standing note · AM-ART5-V2 · Article V · 3 September 2026</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            One amendment exists, and it was made on the same day this procedure was published. A
            reader is entitled to check that against the rules above, so the reasoning is printed
            here rather than left to be inferred.
          </p>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>
              AM-ART5-V2 was made by the operator on 3 September 2026, before any workspace had
              ratified any version of the Charter.
            </li>
            <li>
              The public ledger reports 0 platform seals, so at the time of the amendment there were
              no other active workspaces. Unanimity of all active workspaces was satisfied by the
              operator alone. No member&rsquo;s ratification was overridden, because none existed.
            </li>
            <li>
              The {DELIBERATION_DAYS}-day deliberation window governs proposals put forward by
              members. It does not apply to a version change made by the operator before the first
              ratification.
            </li>
            <li>
              Version 1 remains retrievable with its own digests and its own date. The amendment
              changed the text of Article V and recomputed the digest. It did not rewrite history —
              Articles I to IV carry digests identical to version 1, and both versions are printed
              side by side on the{" "}
              <Link to="/charter" className="text-gold hover:underline">
                Charter
              </Link>
              .
            </li>
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            No Article V digest has ever been Bitcoin-anchored. The three confirmed anchors are the
            three APEX PSI founding records — the Article 50 Enforcement Watch founding record, the
            Dutch AP v Uber equivalence note and the sealed AI memory demo — and the platform record
            layer holds 0 seals of its own. That is the reason the amendment could be made at all:
            no anchored commitment to the old text existed to contradict.
          </p>
        </Panel>

        <div className="mt-10 space-y-4">
          {amendments.isLoading ? (
            <Panel className="p-7 text-sm text-muted-foreground">Reading the record…</Panel>
          ) : rows.length === 0 ? (
            <Panel className="p-7">
              <p className="text-sm text-muted-foreground">
                No amendments have been proposed yet. Version 1 stands unamended — which is itself a
                fact the ledger records.
              </p>
            </Panel>
          ) : (
            rows.map((a) => {
              const total = a.tally.ratify + a.tally.reject + a.tally.abstain;
              const forPct = total ? Math.round((a.tally.ratify / total) * 100) : 0;
              const closed = new Date(a.closes_at).getTime() < Date.now();
              return (
                <Panel key={a.id} className="p-7">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded border border-gold/25 bg-gold/10 px-2 py-0.5 font-mono text-[10px] text-gold">
                          {a.ref}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          Article {a.article_numeral} · {a.threshold}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          {closed
                            ? "Deliberation closed"
                            : `Closes ${new Date(a.closes_at).toLocaleDateString()}`}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
                        {a.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {a.rationale}
                      </p>
                      <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-md border border-border bg-background/60 p-4 font-mono text-xs leading-relaxed text-foreground/80">
                        {a.proposed_text}
                      </pre>
                      <p className="mt-3 break-all font-mono text-[11px] text-muted-foreground">
                        digest {a.digest}
                      </p>
                    </div>

                    <div className="w-full max-w-xs">
                      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                        <span>{a.tally.ratify} ratify</span>
                        <span>{a.tally.reject} reject</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-gold" style={{ width: `${forPct}%` }} />
                      </div>
                      <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                        {a.tally.abstain} abstained · {total} votes
                      </p>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {(
                          [
                            { choice: "ratify", label: "Ratify", Icon: Check },
                            { choice: "reject", label: "Reject", Icon: X },
                            { choice: "abstain", label: "Abstain", Icon: Minus },
                          ] as const
                        ).map(({ choice, label, Icon }) => (
                          <button
                            key={choice}
                            type="button"
                            disabled={!user || closed || vote.isPending}
                            onClick={() => vote.mutate({ amendmentId: a.id, choice })}
                            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-2 py-2 text-xs text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-40"
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                          </button>
                        ))}
                      </div>
                      {!user ? (
                        <p className="mt-3 text-xs text-muted-foreground">
                          <Link to="/auth" className="text-gold hover:underline">
                            Sign in
                          </Link>{" "}
                          as a member to vote.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Panel>
              );
            })
          )}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Draft"
          title="Propose an amendment"
          description="Your draft is hashed on submission. The digest is what members deliberate on — the text cannot change underneath the vote."
        />

        <Panel className="mt-10 max-w-3xl p-7">
          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="eyebrow">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Require co-signature under Article II for withheld-inventory attestations"
                className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-gold/50"
              />
            </label>

            <label className="grid gap-2">
              <span className="eyebrow">Article</span>
              <select
                value={numeral}
                onChange={(e) => setNumeral(e.target.value as typeof numeral)}
                className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-gold/50"
              >
                {ARTICLES.map((a) => (
                  <option key={a.id} value={a.numeral}>
                    Article {a.numeral} — {a.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground">
                {AMENDMENT_THRESHOLDS[numeral]?.detail}
              </span>
            </label>

            <label className="grid gap-2">
              <span className="eyebrow">Rationale</span>
              <textarea
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                rows={4}
                placeholder="What failure condition does the current text leave unenforced?"
                className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-gold/50"
              />
            </label>

            <label className="grid gap-2">
              <span className="eyebrow">Proposed text</span>
              <textarea
                value={proposedText}
                onChange={(e) => setProposedText(e.target.value)}
                rows={7}
                placeholder="The exact clause, as it should read after the amendment."
                className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 font-mono text-xs text-foreground outline-none focus:border-gold/50"
              />
            </label>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                disabled={!user || propose.isPending}
                onClick={() => propose.mutate()}
                className="rounded-md border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/20 disabled:opacity-40"
              >
                {propose.isPending ? "Sealing…" : "Seal and submit"}
              </button>
              {!user ? (
                <p className="text-sm text-muted-foreground">
                  <Link to="/auth" className="text-gold hover:underline">
                    Sign in
                  </Link>{" "}
                  to put a proposal on the record.
                </p>
              ) : null}
            </div>
          </div>
        </Panel>
      </Section>
    </>
  );
}
