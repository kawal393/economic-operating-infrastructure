# DECOUPLING RUNBOOK — sovereign-ai.services off the editor vendor, onto our own host

**Date of record: 16 September 2026.**
**Reason:** the platform was built, hosted and environment-stored by an editor
vendor. Three verified facts made that untenable:

1. **The vendor edge was serving a build older than GitHub HEAD.** On 16 Sep the
   live `<title>` was `Sovereign AI Services - The Global Verification Layer`
   while HEAD (`ca2ba0f`, "Withdrew commerce, fixed pages") builds
   `SOVEREIGNAI.SERVICES - THE OPERATING LAYER OF THE AI ECONOMY`. The provider
   claimed to auto-deploy from GitHub. It did not.
2. **The signing seed lives in the vendor's environment store.**
   `NATION_SIGNING_SEED` is not in this repository and was not on this machine.
   Whoever holds the environment holds the seal of state. That is the opposite of
   sovereign, and it is a single point of failure with no backup we control.
3. **The vendor injected itself into our public bytes.** The live home page
   carried 76 occurrences of the vendor name, including an `og:image` /
   `twitter:image` pointing at a vendor storage bucket with
   `id-preview-…lovable.app` in the filename. Every social share of the estate
   loaded its preview image from someone else's CDN.

---

## What changed in the code

| Surface | Before | After |
|---|---|---|
| `vite.config.ts` | one-line hand-off to `@lovable.dev/vite-tanstack-config` — a vendor package chose our plugins, CSS transformer, env injection and deploy target | every plugin declared explicitly; deploy target chosen by us via `NITRO_PRESET` (default `node-server`) |
| `package.json` | `@lovable.dev/vite-tanstack-config` devDependency; generated name `tanstack_start_ts` | dependency removed; `lightningcss` declared explicitly; `start` script added; name `sovereign-ai-services` |
| `bunfig.toml` | 24h supply-chain guard bypassed for six vendor packages | bypass list emptied — the guard is now unqualified for the whole tree |
| `src/lib/lovable-error-reporting.ts` | forwarded boundary errors into vendor preview telemetry | **deleted**; `src/lib/error-reporting.ts` logs locally and posts only to an endpoint we own, if configured |
| `src/integrations/supabase/previewAuthStorage.ts` | brokered the auth session to the vendor editor over `postMessage` | **deleted**; Supabase's own `localStorage`. A session token never leaves this origin |
| `client.ts`, `client.server.ts`, `auth-middleware.ts` | failure text told the operator to "Connect Supabase in Lovable Cloud" | failure text names the real fix: set the variables in the server environment |
| `.env.example` | did not exist | the complete environment contract, with the seed-migration rule written into it |
| `deploy/` | did not exist | `Caddyfile`, `sovereign-ai.service`, `deploy-to-vps.ps1`, `verify-sovereign.ps1` |

`src` now contains **zero** occurrences of the vendor name (verified by grep and
by crawling the built output — see below).

---

## Verified state after the decoupling build

Local build, `NITRO_PRESET=node-server`, vite build green in 3.13 s, then
`node .output/server/index.mjs` and a 56-route crawl (`deploy/verify-sovereign.ps1`):

- **44 of 56 routes returned 200** with correct `<h1>` text.
- **Vendor strings in the served output: 0** for `lovable`, `lovableproject`,
  `gptengineer`, `Lovable Cloud`, `digital-gallows`. Control strings non-zero, so
  the crawl's reach was proven before the zeros were believed (§15(g) doctrine).
- **Client bundle carries the Supabase URL and publishable key** — one chunk each.
  This is the unlock: on our own host the browser gets real credentials, so
  member sign-in and voting work. They were dead on the vendor host purely
  because only its dashboard could hold those variables (§15(i), still open).
- **No secret leaked into the client bundle.** The single `sb_secret_` hit in
  `.output/public` is supabase-js's own key-format detection code, not a value.

The 12 local 500s are **configuration, not code**, and each is explained:

| Route | Cause on this machine |
|---|---|
| `/charter.json`, `/constitution.json`, `/.well-known/*`, `/api/public/v1/checkpoint`, `/jwks.json`, `/ledger`, `/ledger-stats`, `/api/public/v1/verify`, `/registry`, `/registry/*`, `/entities/*` | `NATION_SIGNING_SEED` not set here, and this sandbox cannot resolve `*.supabase.co` (DNS blocked), so the ledger reads fail. On the VPS both are present. |
| `/treasury` | **404 — the route does not exist.** `README.md` still advertises `/treasury` scale projections. Stale README, not a regression. |

---

## CUTOVER ORDER — do not skip a step

**Step 0 — retrieve the seed before anything else.**
Open the vendor project settings → environment variables → copy
`NATION_SIGNING_SEED`. Do this *while the vendor account still exists*. Without
it, the platform we move to cannot reproduce the signatures the platform we move
from already published: `/api/public/v1/jwks.json` currently serves kid
`sovereign-8eb5f3f6`, and every counterparty holding a checkpoint verifies
against that key.
If the seed cannot be retrieved, the honest path is a **rotation**: publish both
keys in the JWKS, record the rotation as a dated amendment, and announce it. Do
not silently change it.

**Step 1 — prepare the VPS** (ExtraVM Singapore, `199.119.136.64`, 1 GB RAM,
already running `apex-spine`):
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -   # Node 22
apt install -y nodejs caddy
mkdir -p /root/sovereign-ai
# upload .env.example as /root/sovereign-ai/.env, fill every value, then:
chmod 600 /root/sovereign-ai/.env
```
Install `deploy/sovereign-ai.service` to `/etc/systemd/system/`, and
`deploy/Caddyfile` to `/etc/caddy/Caddyfile`.

**Step 2 — ship the build** (from this machine):
```powershell
pwsh deploy/deploy-to-vps.ps1
```
It builds, refuses to restart if the seed is missing, swaps `.output`, restarts,
checks loopback health, then crawls the public URL.

**Step 3 — cut DNS over** (GoDaddy is the registrar for this domain):
```
A   @    -> 199.119.136.64
A   www  -> 199.119.136.64
```
Both records are required: the `www` A record also closes the §15(h) gap where
`www.sovereign-ai.services` resolved but failed TLS. Caddy issues one
certificate for both names automatically once they point here. Lower the TTL
first if you want a fast rollback.

**Step 4 — verify the live bytes, not the deploy log:**
```powershell
pwsh deploy/verify-sovereign.ps1 -Base https://sovereign-ai.services
pwsh deploy/verify-sovereign.ps1 -Base https://www.sovereign-ai.services
```
Pass criteria: 0 vendor strings, controls non-zero, `/api/public/v1/checkpoint`
and `/api/public/v1/jwks.json` returning **200 with the same kid as before**,
and `/registry` returning 200.

**Step 5 — only then** remove the domain from the vendor dashboard. Not before.
The vendor copy is the rollback until the new host has held for a day.

---

## Wounds found in the LIVE estate during this work (independent of hosting)

These were discovered by crawling production, and they are the reason "release
soon" needs a verification gate rather than an announcement:

1. **`/api/public/v1/checkpoint` returns 500 in production.** That is the exact
   URL `/transparency` prints as a copy-paste `curl` command. A stranger who
   follows our own printed instruction gets an error page. `/api/public/v1/ledger`
   and `/registry` also return 500 live, while `/ledger-stats` and `/jwks.json`
   return 200 — so the seed is present live and the failure is in the ledger
   reads. Root cause not yet confirmed; it needs the live server log, which the
   vendor dashboard owns. Self-hosting gives us `journalctl`, which is itself an
   argument for the move.
2. **The live build is stale** (fact 1 above). Anything we believe is published
   may not be.
3. **~~Our own build has no `og:image` at all.~~ FIXED 16 SEP.** The vendor injected
   one; ours had none, which would have left every post-cutover social share with no
   preview image. A sovereign seal-of-state card is now at `public/og-image.jpg`
   (1200×630, ~149 KB) and wired as absolute `og:image` / `twitter:image` (+ title,
   description, url, alt) in `src/routes/__root.tsx`. Verified: it ships in
   `.output/public`, the live head renders all tags, and `GET /og-image.jpg` returns
   200 image/jpeg. No share of this estate loads a byte we do not host.

## Rollback

DNS back to `185.158.133.1`, or on the VPS: move the newest
`.output.prev-*.bak` back to `.output` and `systemctl restart sovereign-ai`.
Nothing in this runbook deletes anything.
