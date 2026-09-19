// SOVEREIGN BUILD CONFIG.
//
// Every plugin is declared here explicitly: a clean clone plus `npm install`
// reproduces the production build with no third-party editor account, no
// sandbox flag and no external deploy pipeline. Nothing outside this
// repository decides our plugins, CSS transformer, env injection or deploy
// target.
//
// Deploy target is ours to choose at build time:
//   NITRO_PRESET=node-server        (default) -> .output/server/index.mjs, Node 20+,
//                                                run behind a TLS terminator on our own host
//   NITRO_PRESET=cloudflare-module  -> .output/server, wrangler deploy (fallback mirror)
import { defineConfig, loadEnv, type UserConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Default preset must match the hosting runtime: this project deploys to an
// edge worker environment, which cannot boot a node-server bundle (that
// mismatch is what produced the 502 "loader error" on the published site).
// Override with NITRO_PRESET=node-server only for self-hosting builds.
const NITRO_PRESET = process.env["NITRO_PRESET"] || "cloudflare-module";

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
      // Output goes to dist/ — the deploy pipeline expects build artefacts there,
      // not nitro's default .output/.
      ...(command === "build" ? [nitro({ preset: NITRO_PRESET, output: { dir: "dist" } })] : []),
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
