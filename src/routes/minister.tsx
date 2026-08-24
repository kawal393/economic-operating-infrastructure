import { createFileRoute, redirect } from "@tanstack/react-router";

/** Permanent redirect — /minister was renamed to /steward. */
export const Route = createFileRoute("/minister")({
  beforeLoad: () => {
    throw redirect({ to: "/steward", statusCode: 301 });
  },
});
