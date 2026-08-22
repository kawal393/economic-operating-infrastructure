import { createFileRoute } from "@tanstack/react-router";
import { ExternalRedirect } from "@/components/external-redirect";
import { APEX_PORTAL } from "@/content/legal";

export const Route = createFileRoute("/sealed-memory")({
  head: () => ({
    meta: [
      { title: "Sealed Memory — routing to APEX PSI | Sovereign AI Services" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "This record lives on the APEX PSI public portal. Routing you there now.",
      },
    ],
  }),
  component: () => <ExternalRedirect to={`${APEX_PORTAL}/sealed-memory`} />,
});
