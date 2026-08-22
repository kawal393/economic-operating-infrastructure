export const INTEGRATION_CATEGORIES = [
  "AI Agents",
  "LLM Frameworks",
  "Automation",
  "Cloud",
  "Auth",
  "Data",
  "Compliance",
] as const;

export type IntegrationCategory = (typeof INTEGRATION_CATEGORIES)[number];
export type IntegrationStatus = "Available Now" | "In Development" | "Coming Soon";

export type Integration = {
  id: string;
  name: string;
  mark: string;
  category: IntegrationCategory;
  description: string;
  install: string;
  status: IntegrationStatus;
  docs: string;
  external?: boolean;
};

export const INTEGRATIONS: Integration[] = [
  {
    id: "mcp",
    name: "MCP Server for AI Agents",
    mark: "MC",
    category: "AI Agents",
    description:
      "Any MCP-compatible agent can become a member automatically. Get a wallet, a member number, and voting rights.",
    install: "npx @apex/nation-mcp",
    status: "Available Now",
    docs: "/mcp",
  },
  {
    id: "langchain",
    name: "LangChain Agent Integration",
    mark: "LC",
    category: "LLM Frameworks",
    description:
      "Wrap any LangChain agent to make it a member. It can seal its decisions, vote on proposals, and deploy micro-nations.",
    install: "pip install langchain-apex-nation",
    status: "Available Now",
    docs: "/docs",
  },
  {
    id: "composio",
    name: "Composio Custom Actions",
    mark: "CO",
    category: "AI Agents",
    description:
      "Register the platform as a custom action set in Composio. Now any agent can call seal, verify, register-member, deploy-workspace, vote — all as native actions.",
    install: "Install via Composio's action directory",
    status: "Available Now",
    docs: "/docs",
  },
  {
    id: "nango",
    name: "Nango OAuth Bridge",
    mark: "NA",
    category: "Auth",
    description:
      "Let users of any app that integrates with Nango use their existing login to become members. No new wallet, no new password.",
    install: "npm i @apex/nation-nango",
    status: "Available Now",
    docs: "/docs",
  },
  {
    id: "arcade",
    name: "Arcade.dev Just-in-Time Auth",
    mark: "AR",
    category: "Auth",
    description:
      "Agents on Arcade can request member status at runtime, get a wallet provisioned automatically, and start transacting.",
    install: "arcade install apex-nation",
    status: "Coming Soon",
    docs: "/docs",
  },
  {
    id: "huggingface",
    name: "Hugging Face Space",
    mark: "HF",
    category: "Cloud",
    description:
      "Deploy your AI model as a member of the nation directly from Hugging Face. Free GPU plus automatic registry membership.",
    install: "pip install gradio apex-nation",
    status: "Available Now",
    docs: "/docs",
  },
  {
    id: "make",
    name: "Make.com Custom App",
    mark: "MK",
    category: "Automation",
    description:
      "Drag and drop platform actions into any Make scenario. Your automations can now register members, deploy workspaces, seal decisions, and pay fees — all visually.",
    install: 'Search "APEX Nation" in the Make app directory',
    status: "Available Now",
    docs: "/docs",
  },
  {
    id: "pipedream",
    name: "Pipedream Workflow Component",
    mark: "PD",
    category: "Automation",
    description:
      "Serverless workflows can call platform APIs natively. Build a workflow that watches an event, seals it, anchors it to Bitcoin, and registers it as a member decision.",
    install: 'Search "APEX Nation" in Pipedream',
    status: "Available Now",
    docs: "/docs",
  },
  {
    id: "activepieces",
    name: "Activepieces Piece",
    mark: "AP",
    category: "Automation",
    description:
      "Open source automation with a native platform piece. One click install from the Pieces library.",
    install: 'Install "APEX Nation" from the Pieces library',
    status: "Available Now",
    docs: "/docs",
  },
  {
    id: "zapier",
    name: "Zapier App",
    mark: "ZP",
    category: "Automation",
    description:
      "No-code platform actions for 5,000+ apps. Connect Gmail to seal every email. Connect Stripe to seal every transaction. Connect Slack to vote on proposals.",
    install: 'Search "APEX Nation" in Zapier',
    status: "Coming Soon",
    docs: "/docs",
  },
  {
    id: "vercel",
    name: "Vercel AI SDK Plugin",
    mark: "VC",
    category: "LLM Frameworks",
    description:
      "Any Vercel AI agent gets automatic registry membership and a wallet on first run.",
    install: "npm i @apex/nation-vercel",
    status: "Available Now",
    docs: "/docs",
  },
  {
    id: "openai",
    name: "OpenAI Function Calling",
    mark: "OA",
    category: "LLM Frameworks",
    description:
      "Register the platform as a function in any OpenAI powered app. The model can now call seal, verify, register-member, deploy-workspace, vote as native functions.",
    install: "npm i @apex/nation-openai",
    status: "Available Now",
    docs: "/docs",
  },
];

export const HOMEPAGE_INTEGRATION_LINKS = [
  { label: "Anthropic MCP", hash: "mcp" },
  { label: "LangChain", hash: "langchain" },
  { label: "Composio", hash: "composio" },
  { label: "Nango", hash: "nango" },
  { label: "Hugging Face", hash: "huggingface" },
  { label: "Make", hash: "make" },
  { label: "Pipedream", hash: "pipedream" },
  { label: "Activepieces", hash: "activepieces" },
  { label: "Zapier", hash: "zapier" },
  { label: "Vercel", hash: "vercel" },
  { label: "OpenAI", hash: "openai" },
] as const;

export const MCP_CLIENTS = [
  {
    id: "claude",
    label: "Claude Desktop",
    path: "~/Library/Application Support/Claude/claude_desktop_config.json",
    config: `{
  "mcpServers": {
    "apex-nation": {
      "command": "npx",
      "args": ["-y", "@apex/nation-mcp"]
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
      "command": "npx",
      "args": ["-y", "@apex/nation-mcp"]
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
    command: npx
    args:
      - "-y"
      - "@apex/nation-mcp"`,
  },
  {
    id: "goose",
    label: "Goose",
    path: "~/.config/goose/config.yaml",
    config: `extensions:
  apex-nation:
    enabled: true
    type: stdio
    cmd: npx
    args:
      - "-y"
      - "@apex/nation-mcp"`,
  },
  {
    id: "cline",
    label: "Cline",
    path: "~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json",
    config: `{
  "mcpServers": {
    "apex-nation": {
      "command": "npx",
      "args": ["-y", "@apex/nation-mcp"],
      "disabled": false
    }
  }
}`,
  },
] as const;

export const MCP_TOOLS = [
  {
    name: "seal",
    does: "Signs any content and returns a platform receipt.",
    params: "The content or file the agent wants sealed, plus an optional label.",
    returns: "A receipt ID, the SHA-256 digest and an Ed25519 signature.",
    example: `agent: seal(content: "Approved refund #8812", label: "decision")
-> receipt_id: rcpt_7f2a...  digest: 9c1b...
-> verify at /verify`,
  },
  {
    name: "verify",
    does: "Checks any hash or receipt and returns valid or invalid.",
    params: "A receipt ID or a content digest, and optionally the original content.",
    returns: "Valid or invalid, with the signing key and the ledger position.",
    example: `agent: verify(receipt_id: "rcpt_7f2a...")
-> status: valid
-> signed_by: ed25519:4b8d...`,
  },
  {
    name: "anchor",
    does: "Submits a seal to Bitcoin via OpenTimestamps.",
    params: "A receipt ID that already exists on the public ledger.",
    returns: "An OpenTimestamps proof and the pending or confirmed anchor state.",
    example: `agent: anchor(receipt_id: "rcpt_7f2a...")
-> ots_proof: base64:AE9wZW5U...
-> state: pending_confirmation`,
  },
  {
    name: "cite",
    does: "Returns a regulator ready citation for a sealed item.",
    params: "A receipt ID and an optional framework such as the EU AI Act.",
    returns: "A formatted citation string with a permanent verification URL.",
    example: `agent: cite(receipt_id: "rcpt_7f2a...", framework: "eu-ai-act")
-> "Sealed 2026-08-07T00:04Z · digest 9c1b... · Art. 50"
-> https://sovereign-ai.services/r/rcpt_7f2a...`,
  },
  {
    name: "audit",
    does: "Returns all seals recorded for an entity.",
    params: "An entity slug, member number or public key, plus an optional date range.",
    returns: "A chronological list of receipts with digests and anchor states.",
    example: `agent: audit(entity: "acme-labs", since: "2026-07-01")
-> 148 receipts · 96 anchored
-> chain_head: 3ad0...`,
  },
] as const;
