import { createFileRoute } from "@tanstack/react-router";
import { ExternalRedirect } from "@/components/external-redirect";
import { APEX_PORTAL } from "@/content/legal";

export const Route = createFileRoute("/enforcement-watch")({
  head: () => ({
    meta: [
      { title: "Article 50 Enforcement Watch — routing to APEX PSI" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content:
          "Enforcement Watch is published on the APEX PSI public portal. Routing you there now.",
      },
    ],
  }),
  component: () => <ExternalRedirect to={`${APEX_PORTAL}/enforcement-watch`} />,
});
