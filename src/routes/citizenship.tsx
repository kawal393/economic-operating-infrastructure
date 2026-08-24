import { createFileRoute, redirect } from "@tanstack/react-router";

/** Permanent redirect — /citizenship was renamed to /registry-join. */
export const Route = createFileRoute("/citizenship")({
  beforeLoad: () => {
    throw redirect({ to: "/registry-join", statusCode: 301 });
  },
});
