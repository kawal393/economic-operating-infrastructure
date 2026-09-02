import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { ARTICLE3_STATUS, CUSTODY_FENCE } from "@/content/legal";
import { FEES, SCALE_MODEL } from "@/content/nation";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transaction Model — What the Fee Schedule Would Produce | Sovereign AI Services" },
      {
        name: "description",
        content:
          "No transaction has ever been charged on this platform: no payment processor is connected. This page publishes the fee schedule and the arithmetic behind the scale model, with its formula printed, and points to the live public ledger for what has actually happened.",
      },
      { property: "og:title", content: "Transaction Model" },
      {
        property: "og:description",
        content:
          "The published fee schedule and the scale model with its formula. No transaction has ever been charged.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/transactions" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/transactions" }],
  }),
  component: TransactionsPage,
});

// NOTHING ON THIS PAGE IS METERED, SIMULATED OR STREAMED.
//
// This route used to render a “Transaction Dashboard”: four headline counters
// (41,208,996 transactions in 24h, 13,904,221,760 a year, $21,406,884 of revenue),
// a twelve-bar revenue trend, a fee-mix split by percentage, and a table headed
// “Live transaction stream” carrying eight rows with ids, protocols, dollar amounts
// and timestamps. Every one of those numbers was typed into this file. There was no
// meter, no payment processor and no formula that produced any of them, and the
// page's own warning banner contradicted the table beneath it.
//
// What remains is what can be defended: the published fee schedule, the scale model
// with its arithmetic printed beside it, and a pointer to the live ledger, which is
// the only record of anything that has actually happened.

function TransactionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Transaction model"
        title="No transaction has ever been charged on this platform"
        description="No payment processor is connected, so nothing here is chargeable and no revenue has been collected. What is published below is the price list and the arithmetic — stated before a cent is ever taken, so it can be checked against what happens later."
      >
        <Link
          to="/ledger"
          className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
        >
          Open the live public ledger
        </Link>
      </PageHeader>

      <Section className="pb-0 pt-10">
        <Panel className="border-warning/40 bg-warning/5 p-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-warning">
            What this page used to claim
          </p>
          <p className="mt-3.5 text-sm leading-relaxed text-foreground">
            An earlier version of this route printed a transaction volume of 41,208,996 in
            twenty-four hours and 13,904,221,760 a year, protocol revenue of $21,406,884, a
            twelve-bar revenue trend, a fee mix split into percentages, and a table headed “Live
            transaction stream” with eight settled rows carrying ids, dollar amounts and timestamps.
            None of it came from a meter, a database or a payment. A banner at the top said the
            figures were simulated while the table below presented them as live, which is worse than
            either on its own. All of it is deleted rather than relabelled: a number with no source
            and no formula cannot be made honest by writing “modelled” beside it.
          </p>
          <p className="mt-3.5 text-sm leading-relaxed text-foreground">{CUSTODY_FENCE}</p>
        </Panel>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Published schedule"
          title="What each action would cost"
          description="Uniform, published, and identical for every member. These are the prices the platform commits to before charging them; the routing line is fenced because the service behind it does not run."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEES.map((fee) => (
            <Panel key={fee.label}>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {fee.label}
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-gold">{fee.price}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {fee.unit}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{fee.note}</p>
            </Panel>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          {ARTICLE3_STATUS}
        </p>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Scale model"
          title="The arithmetic, with its assumptions printed"
          description="A model is only honest if a stranger can redo it. These rows are projections from the published schedule at a stated usage assumption, not forecasts and not revenue."
        />
        <Panel className="mt-10 overflow-x-auto p-7">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {["Horizon", "Annual verifications", "Annual protocol revenue"].map((h) => (
                  <th
                    key={h}
                    className="py-3 pr-6 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SCALE_MODEL.map((row) => (
                <tr key={row.horizon}>
                  <td className="py-4 pr-6 text-sm font-medium text-foreground">
                    {row.horizon} <span className="text-warning">(modelled)</span>
                  </td>
                  <td className="py-4 pr-6 font-mono text-sm text-muted-foreground">
                    {row.verifications}
                  </td>
                  <td className="py-4 font-mono text-sm text-gold">{row.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Formula: 300 metered verifications per member per month × 12 × $0.001 — for example, 1M
          members × 3,600 verifications/year × $0.001 = $3.6M/year. Redo it yourself; the inputs are
          the member count and the published price, nothing else. Realised revenue to date is zero,
          because no payment processor is connected to this platform.
        </p>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="The real record"
          title="What has actually happened"
          description="Seals published to the hash-linked ledger, and the Bitcoin anchors that timestamp them. Read live, by anyone, with no account and no key."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link to="/ledger">
            <Panel interactive className="h-full">
              <p className="eyebrow">Public ledger</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Every published seal, hash-linked to the one before it, with its receipt and its
                anchor status. The counters on that page are read from the database at load.
              </p>
            </Panel>
          </Link>
          <Link to="/pricing">
            <Panel interactive className="h-full">
              <p className="eyebrow">Pricing</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The same schedule with the membership tiers, and the statement of what can and
                cannot be bought today.
              </p>
            </Panel>
          </Link>
        </div>
      </Section>
    </>
  );
}
