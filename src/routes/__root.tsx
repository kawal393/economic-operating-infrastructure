import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportClientError } from "../lib/error-reporting";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Looking for a sealed record?{" "}
          <a
            href="https://www.ai-governance-standard.com/verify"
            className="text-gold hover:underline"
          >
            Verify on APEX PSI →
          </a>
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset?: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportClientError(error, { boundary: "tanstack_root_error_component" }, {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset?.();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SOVEREIGNAI.SERVICES — THE OPERATING LAYER OF THE AI ECONOMY" },
      {
        name: "description",
        content:
          "Verification and record-keeping infrastructure for AI agents and their operators: post-quantum sealing, Bitcoin anchoring, free public receipts and a machine-readable Protocol Charter.",
      },
      { name: "author", content: "Sovereign AI Services" },
      // Social card. The og:image/twitter:image URLs are absolute on purpose:
      // crawlers (LinkedIn, X, WhatsApp, iMessage) resolve relative URLs against
      // nothing and drop the preview. This is our own asset in /public — the
      // vendor used to inject an og:image from its own storage bucket; it no
      // longer does, and no share of this estate loads a byte we do not host.
      { property: "og:site_name", content: "Sovereign AI Services" },
      { property: "og:type", content: "website" },
      {
        property: "og:title",
        content: "SOVEREIGNAI.SERVICES — The Operating Layer of the AI Economy",
      },
      {
        property: "og:description",
        content:
          "Verification and record-keeping infrastructure for AI agents and their operators: post-quantum sealing, Bitcoin anchoring, free public receipts and a machine-readable Protocol Charter.",
      },
      { property: "og:url", content: "https://sovereign-ai.services/" },
      { property: "og:image", content: "https://sovereign-ai.services/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Sovereign AI Services — Seal of State" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "SOVEREIGNAI.SERVICES — The Operating Layer of the AI Economy",
      },
      {
        name: "twitter:description",
        content:
          "Verification and record-keeping infrastructure for AI agents and their operators: post-quantum sealing, Bitcoin anchoring, free public receipts and a machine-readable Protocol Charter.",
      },
      { name: "twitter:image", content: "https://sovereign-ai.services/og-image.jpg" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
