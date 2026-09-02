/**
 * INTEGRATION SURFACE — REWRITTEN 3 SEPTEMBER 2026.
 *
 * This file previously listed twelve third-party integrations, ten of them
 * badged "Available Now", each with an install command a reader was invited to
 * copy and run. Every package name was checked against registry.npmjs.org and
 * pypi.org on 3 September 2026 and every one returned HTTP 404:
 *
 *   @apex/nation-mcp, @apex/nation-nango, @apex/nation-vercel,
 *   @apex/nation-openai, langchain-apex-nation, apex-nation
 *
 * A published instruction to run `npx -y @apex/nation-mcp` against an
 * unregistered name is an open supply-chain slot: anyone may register that name
 * and ship hostile code, and this platform's own documentation would have told
 * readers to install it — without a confirmation prompt — into Claude Desktop,
 * Cursor, Continue, Goose and Cline.
 *
 * Every install command has therefore been removed. What remains is the real
 * HTTP surface served by this deployment, plus written notes that say plainly
 * that nothing is published behind them. DO NOT REINTRODUCE PACKAGE COMMANDS
 * UNTIL A PACKAGE IS ACTUALLY PUBLISHED.
 */

export const INTEGRATION_CATEGORIES = [
  "Public API",
  "Records",
  "Verification",
  "Machine interfaces",
  "Written notes",
] as const;

export type IntegrationCategory = (typeof INTEGRATION_CATEGORIES)[number];

/**
 * "Live API" means the path is served by this deployment and returns data.
 * "Not published" means a note was written and no package, listing or
 * deployment exists behind it. There is no third status. Nothing here is
 * "coming soon".
 */
export type IntegrationStatus = "Live API" | "Not published";

export type Integration = {
  id: string;
  name: string;
  mark: string;
  category: IntegrationCategory;
  description: string;
  /** A real path a reader can call, or an explicit statement that none exists. */
  access: string;
  status: IntegrationStatus;
  docs: string;
};

const NOTHING_PUBLISHED =
  "Nothing published. No package, listing or deployment exists — do not install anything under this name.";

const LIVE: Integration[] = [
  {
    id: "openapi",
    name: "OpenAPI document",
    mark: "{}",
    category: "Public API",
    description:
      "Returns the machine-readable OpenAPI description of every public path on this deployment. No account and no key are needed to read it.",
    access: "GET /openapi.json",
    status: "Live API",
    docs: "/docs",
  },
  {
    id: "ledger",
    name: "Public ledger",
    mark: "LG",
    category: "Records",
    description:
      "Returns recorded ledger entries with their receipt identifiers, sequence numbers, chain hashes and anchor states. No account and no key are needed.",
    access: "GET /api/public/v1/ledger",
    status: "Live API",
    docs: "/ledger",
  },
  {
    id: "ledger-stats",
    name: "Ledger statistics",
    mark: "LS",
    category: "Records",
    description:
      "Returns the counters printed on this site — seals recorded, Bitcoin anchors confirmed and pending, and the most recent events — so a stranger can recompute every figure. No account and no key are needed.",
    access: "GET /api/public/v1/ledger-stats",
    status: "Live API",
    docs: "/ledger",
  },
  {
    id: "verify",
    name: "Verify a digest",
    mark: "VF",
    category: "Verification",
    description:
      "Reports whether a SHA-256 digest has been sealed, and returns every occurrence with its receipt. GET takes ?digest=; POST takes a JSON body of { digest } or { receipt }. No account and no key are needed.",
    access: "GET /api/public/v1/verify?digest={digest} · POST /api/public/v1/verify",
    status: "Live API",
    docs: "/verify",
  },
  {
    id: "receipt",
    name: "Receipt by identifier",
    mark: "RC",
    category: "Verification",
    description:
      "Returns the recorded receipt for an identifier, with its permalink, badge path and proof path. An unknown identifier returns an explicit not-found response. No account and no key are needed.",
    access: "GET /api/public/v1/receipt/{receiptId}",
    status: "Live API",
    docs: "/verify",
  },
  {
    id: "proof",
    name: "Anchoring proof",
    mark: "PR",
    category: "Verification",
    description:
      "Returns the Merkle inclusion proof for a receipt. Where no proof has been produced yet, the path says so rather than returning a placeholder. No account and no key are needed.",
    access: "GET /api/public/v1/proof/{receiptId}",
    status: "Live API",
    docs: "/transparency",
  },
  {
    id: "jwks",
    name: "Signing key set",
    mark: "JW",
    category: "Machine interfaces",
    description:
      "Returns the public keys used to sign responses from this deployment, so a signature can be checked independently. These keys are public by design; nothing secret is served here.",
    access: "GET /api/public/v1/jwks.json",
    status: "Live API",
    docs: "/docs",
  },
  {
    id: "checkpoint",
    name: "Checkpoint",
    mark: "CP",
    category: "Machine interfaces",
    description:
      "Returns the current signed transparency-log checkpoint: tree size and root hash, for monitors that follow the log over time. No account and no key are needed.",
    access: "GET /api/public/v1/checkpoint",
    status: "Live API",
    docs: "/transparency",
  },
  {
    id: "badge",
    name: "Verification badge",
    mark: "BG",
    category: "Machine interfaces",
    description:
      "Returns an SVG badge reporting whether a digest is on the record, suitable for embedding. No account and no key are needed.",
    access: "GET /api/public/badge/{digest}.svg",
    status: "Live API",
    docs: "/docs",
  },
];

const NOTE = (
  id: string,
  name: string,
  mark: string,
  description: string,
): Integration => ({
  id,
  name,
  mark,
  category: "Written notes",
  description,
  access: NOTHING_PUBLISHED,
  status: "Not published",
  docs: "/docs",
});

const NOTES: Integration[] = [
  NOTE(
    "mcp",
    "MCP server",
    "MC",
    "A written note describing what a Model Context Protocol server for this platform would expose. No server has been published, listed or submitted to any client directory.",
  ),
  NOTE(
    "langchain",
    "LangChain",
    "LC",
    "A written note describing how a LangChain tool wrapper would call the public paths. No package has been published; the name previously printed here returned 404 on PyPI when checked.",
  ),
  NOTE(
    "composio",
    "Composio",
    "CO",
    "A written note describing how the public paths could be registered as a Composio action set. Nothing has been published, listed or submitted to Composio.",
  ),
  NOTE(
    "nango",
    "Nango",
    "NA",
    "A written note describing how a Nango-brokered login could be used against the public paths. No package has been published and no Nango listing exists.",
  ),
  NOTE(
    "arcade",
    "Arcade.dev",
    "AR",
    "A written note describing how runtime authorisation on Arcade could be paired with the public paths. Nothing has been published, listed or submitted to Arcade.",
  ),
  NOTE(
    "huggingface",
    "Hugging Face",
    "HF",
    "A written note describing how a Space could call the public paths from a model demo. No Space, package or listing has been published.",
  ),
  NOTE(
    "make",
    "Make",
    "MK",
    "A written note describing what a Make app for this platform would do. No app has been published, listed or submitted to the Make directory.",
  ),
  NOTE(
    "pipedream",
    "Pipedream",
    "PD",
    "A written note describing what a Pipedream component would do. No component has been published, listed or submitted.",
  ),
  NOTE(
    "activepieces",
    "Activepieces",
    "AP",
    "A written note describing what an Activepieces piece would do. No piece has been published, listed or submitted.",
  ),
  NOTE(
    "zapier",
    "Zapier",
    "ZP",
    "A written note describing what a Zapier app would do. No app has been published, listed or submitted to Zapier.",
  ),
  NOTE(
    "vercel",
    "Vercel AI SDK",
    "VC",
    "A written note describing how a Vercel AI SDK tool would call the public paths. No package has been published; the name previously printed here returned 404 on npm when checked.",
  ),
  NOTE(
    "openai",
    "OpenAI function calling",
    "OA",
    "A written note describing how the public paths would be exposed as callable functions. No package has been published; the name previously printed here returned 404 on npm when checked. The public HTTP paths above can be called from any function-calling setup with no package at all.",
  ),
];

export const INTEGRATIONS: Integration[] = [...LIVE, ...NOTES];

/**
 * Labels naming third parties refer to integration NOTES published here.
 * Naming a third party is descriptive only. It is not a claim of endorsement,
 * partnership, review or a working connector, and none of the parties named has
 * approved anything published on this site.
 */
export const HOMEPAGE_INTEGRATION_LINKS = [
  { label: "Public HTTP API", hash: "openapi" },
  { label: "Ledger", hash: "ledger" },
  { label: "Verify", hash: "verify" },
  { label: "JWKS", hash: "jwks" },
  { label: "Badge", hash: "badge" },
  { label: "MCP (note only)", hash: "mcp" },
  { label: "LangChain (note only)", hash: "langchain" },
  { label: "Zapier (note only)", hash: "zapier" },
  { label: "OpenAI (note only)", hash: "openai" },
] as const;

export const MCP_NOT_PUBLISHED =
  "@apex/nation-mcp IS NOT PUBLISHED — this name is unregistered on npm";

/**
 * The client config SHAPES are kept because they document where each client
 * expects an MCP server to be declared, which is genuinely useful. The commands
 * are deliberate placeholders that fail loudly: an unregistered npm name behind
 * `npx -y` would silently install whatever a stranger later publishes under it.
 * Goose is disabled and Cline is disabled so that even a pasted config refuses
 * to launch. Restore a real command only when a real package exists.
 */
export const MCP_CLIENTS = [
  {
    id: "claude",
    label: "Claude Desktop",
    path: "~/Library/Application Support/Claude/claude_desktop_config.json",
    config: `{
  "mcpServers": {
    "apex-nation": {
      "command": "NOT-PUBLISHED",
      "args": ["${MCP_NOT_PUBLISHED}"]
    }
  }
}`,
  },
  {
    id: "cursor",
    label: "Cursor",
    path: "~/.cursor/mcp.json  (or .cursor/mcp.json in your project)",
    config: `{
  "mcpServers": {
    "apex-nation": {
      "command": "NOT-PUBLISHED",
      "args": ["${MCP_NOT_PUBLISHED}"]
    }
  }
}`,
  },
  {
    id: "continue",
    label: "Continue.dev",
    path: "~/.continue/config.yaml",
    config: `mcpServers:
  - name: apex-nation
    command: NOT-PUBLISHED
    args:
      - "${MCP_NOT_PUBLISHED}"`,
  },
  {
    id: "goose",
    label: "Goose",
    path: "~/.config/goose/config.yaml",
    config: `extensions:
  apex-nation:
    enabled: false
    type: stdio
    cmd: NOT-PUBLISHED
    args:
      - "${MCP_NOT_PUBLISHED}"`,
  },
  {
    id: "cline",
    label: "Cline",
    path: "~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json",
    config: `{
  "mcpServers": {
    "apex-nation": {
      "command": "NOT-PUBLISHED",
      "args": ["${MCP_NOT_PUBLISHED}"],
      "disabled": true
    }
  }
}`,
  },
] as const;

/**
 * A SPECIFICATION OF INTENDED BEHAVIOUR — not a list of tools anyone can call
 * today. No MCP server is published, so none of these can be invoked. Written
 * in the conditional mood for that reason.
 */
export const MCP_TOOLS = [
  {
    name: "seal",
    does: "Would sign submitted content and return a platform receipt.",
    params: "The content or file the agent wants sealed, plus an optional label.",
    returns: "A receipt ID, the SHA-256 digest and an Ed25519 signature.",
    example: `agent: seal(content: "Approved refund #8812", label: "decision")
-> receipt_id: rcpt_7f2a...  digest: 9c1b...
-> verify at /verify`,
  },
  {
    name: "verify",
    does:
      "Would check a hash or receipt against the record. The same check is live today over HTTP at /api/public/v1/verify.",
    params: "A receipt ID or a content digest, and optionally the original content.",
    returns: "Whether the digest is on the record, with the signing key and the ledger position.",
    example: `agent: verify(receipt_id: "rcpt_7f2a...")
-> on_ledger: true
-> signed_by: ed25519:4b8d...`,
  },
  {
    name: "anchor",
    does: "Would submit a seal to Bitcoin via OpenTimestamps.",
    params: "A receipt ID that already exists on the public ledger.",
    returns: "An OpenTimestamps proof and the pending or confirmed anchor state.",
    example: `agent: anchor(receipt_id: "rcpt_7f2a...")
-> ots_proof: base64:AE9wZW5U...
-> state: pending_confirmation`,
  },
  {
    name: "cite",
    does: "Would return a citation string for a sealed item.",
    params: "A receipt ID.",
    returns: "A formatted citation string with a permanent verification URL.",
    example: `agent: cite(receipt_id: "rcpt_7f2a...")
-> "Sealed 2026-08-07T00:04Z · digest 9c1b..."
-> https://sovereign-ai.services/r/rcpt_7f2a...`,
  },
  {
    name: "audit",
    does: "Would return the seals recorded for a listing.",
    params: "A listing slug or public key, plus an optional date range.",
    returns: "A chronological list of receipts with digests and anchor states.",
    example: `agent: audit(entity: "acme-labs", since: "2026-07-01")
-> receipts returned in date order
-> chain_head: 3ad0...`,
  },
] as const;
