-- Charter version 2: Article V amended, Articles I-IV carried forward byte-identical.
insert into public.constitution_versions
  (version, name, tagline, digest, summary, anchor_status, effective_from)
values
  (2,
   'The Constitution of the AI Era',
   'A constitution is only written once — but it can be updated forever.',
   '12d4258a72d76548779c3c7abbe884af6c24b53437edd1672aa2404deca5b63f',
   'Amendment AM-ART5-V2. Article V renamed PSI-Non-Capture and rewritten: the adversary list (regulator, court) and the "seizing the operator" and "that cap is the product" sentences are removed; a paragraph is added stating that the Article takes no position against any government, regulator or court and that records are producible to any authority on request. Articles I, II, III and IV are carried forward byte-identical, verifiable by comparing their version-independent text digests on /charter#versions.',
   'sealed',
   '2026-09-03T00:00:00.000Z')
on conflict (version) do update
  set digest = excluded.digest,
      summary = excluded.summary,
      effective_from = excluded.effective_from,
      anchor_status = excluded.anchor_status;

-- Disclose, in the version 1 row itself, that its stored digest predates version scoping.
update public.constitution_versions
   set summary = summary || ' Superseded by version 2 on 3 September 2026. The digest stored on this row was recorded on 6 August 2026; Article text was edited before version scoping existed, so this stored digest no longer matches the frozen version 1 text published on /charter#versions. The divergence is disclosed rather than overwritten.'
 where version = 1
   and summary not like '%Superseded by version 2%';

-- The amendment itself, on the public record, closed and carried.
insert into public.amendments
  (user_id, ref, title, article_numeral, rationale, proposed_text, digest, threshold, opens_at, closes_at, status)
values
  (null,
   'AM-ART5-V2',
   'Article V — remove the adversary framing, add cooperation with lawful authority',
   'V',
   'The version 1 text named "a regulator, a court" among the parties whose arrival the Article was designed against, and stated that "seizing the operator yields an operator, not the network". Read by a person holding authority, that is a published statement that the platform was engineered to withstand lawful process. The technical property being described — tamper-evidence that survives a change of operator — is real and is retained. The framing that the property exists to defeat an authority is removed, and replaced with an explicit statement that records are producible to any authority on request. The term "archon" is removed from the operative text. Threshold: Articles I and V require unanimity of active workspaces; at the time of this amendment there were no ratifying members and no other active workspaces, so unanimity was satisfied by the operator alone. That fact is recorded here rather than presented as a broad mandate.',
   'Control of this platform will change hands. A founder, an acquirer, or any successor will end up holding the keys. Article V assumes that control will eventually concentrate, and designs so that concentration cannot alter the record. Therefore: verification requires no platform, receipts verify offline, the ledger is mirrored in full by anyone who asks, and the trust anchor is archivable. Control of the operator changes who runs the service. It does not change what the record says. The platform publicly accepts that this limits its own power permanently. That limit is the point of the design. Nothing in this Article is a position against any government, regulator or court. A record that cannot be altered privately is equally a record that can be produced publicly. These seals are designed to be handed to any authority that asks for them, and the platform has never refused one.',
   '19ac38cb111462bec2a4f614a4241c4ca8ebce1610cafa708c2237f419eb2fe7',
   'unanimity',
   '2026-09-03T00:00:00.000Z',
   '2026-09-03T00:00:00.000Z',
   'ratified')
on conflict (ref) do nothing;