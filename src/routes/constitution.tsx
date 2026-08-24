import { createFileRoute, redirect } from "@tanstack/react-router";

/** Permanent redirect — /constitution was renamed to /charter. */
export const Route = createFileRoute("/constitution")({
  beforeLoad: () => {
    throw redirect({ to: "/charter", statusCode: 301 });
  },
});
