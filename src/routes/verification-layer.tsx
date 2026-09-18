import { createFileRoute, redirect } from "@tanstack/react-router";

/** Permanent redirect — the verification layer content is now the homepage. */
export const Route = createFileRoute("/verification-layer")({
  beforeLoad: () => {
    throw redirect({ to: "/", statusCode: 301 });
  },
});
