import { createFileRoute } from "@tanstack/react-router";
import { ExternalRedirect } from "@/components/external-redirect";
import { APEX_PORTAL } from "@/content/legal";

export const Route = createFileRoute("/r/$receiptId")({
  head: () => ({
    meta: [
      { title: "Sealed record — routing to APEX PSI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RedirectRecord,
});

function RedirectRecord() {
  const { receiptId } = Route.useParams();
  return <ExternalRedirect to={`${APEX_PORTAL}/r/${encodeURIComponent(receiptId)}`} />;
}
