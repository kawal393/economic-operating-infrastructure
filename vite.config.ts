// SOVEREIGN BUILD CONFIG.
//
// This file used to be a one-line hand-off to `@lovable.dev/vite-tanstack-config`,
// which meant a vendor package decided our plugins, our CSS transformer, our env
// injection and our deploy target. Nothing outside this repository decides those
// things any more. Every plugin is declared here explicitly, so a clean clone plus
// `npm install` reproduces the production byte-for-byte with no editor account,
// no sandbox flag and no vendor deploy pipeline.
//
// Deploy target is ours to choose at build time:
//   NITRO_PRESET=node-server        (default) -> .output/server/index.mjs, Node 20+,
//                                                run under systemd behind Caddy on our own VPS
//   NITRO_PRESET=cloudflare-module  -> .output/server, wrangler deploy (fallback mirror)
import { defineConfig, loadEnv, type UserConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

const NITRO_PRESET = process.env["NITRO_PRESET"] || "node-server";

export default defineConfig(({ command, mode }) => {
  // Vite replaces `import.meta.env.VITE_*` on the client by default; the editor
  // wrapper additionally pinned them through `define` so SSR and the browser can
  // never disagree. That guarantee is kept, deliberately, because a hydration
  // mismatch here is what produced the 3 Sep white-screen on seven routes.
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), "VITE_"))) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  const config: UserConfig = {
    define: envDefine,
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      ignoreOutdatedRequests: true,
    },
    server: {
      host: "::",
      port: 8080,
      watch: {
        // Generated trees churn constantly and must not retrigger the dev server.
        ignored: ["**/.tanstack/**", "**/.output/**", "**/deploy/**"],
        awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 100 },
      },
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
        // Our SSR error wrapper (src/server.ts) is the server entry: it catches the
        // h3-swallowed 500s and renders the error page instead of opaque JSON.
        server: { entry: "server" },
      }),
      // Nitro is a build-time concern only; dev is served by Vite.
      ...(command === "build" ? [nitro({ preset: NITRO_PRESET })] : []),
      viteReact(),
    ],
  };

  if (mode === "development" && command === "build") {
    config.environments = {
      client: { define: { "process.env.NODE_ENV": JSON.stringify("development") } },
    };
    // NOTE: `esbuild.keepNames` was dropped with Vite 8 — the rolldown-based
    // esbuild compatibility layer no longer accepts it. It only ever affected
    // `build:dev` artefacts (cosmetic function names), never production.
  }

  return config;
});
