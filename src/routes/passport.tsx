import { createFileRoute, redirect } from "@tanstack/react-router";

/** Permanent redirect — /passport was renamed to /credentials. */
export const Route = createFileRoute("/passport")({
  beforeLoad: () => {
    throw redirect({ to: "/credentials", statusCode: 301 });
  },
});
