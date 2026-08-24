import { createFileRoute, redirect } from "@tanstack/react-router";

/** Permanent redirect — /government was renamed to /architecture. */
export const Route = createFileRoute("/government")({
  beforeLoad: () => {
    throw redirect({ to: "/architecture", statusCode: 301 });
  },
});
