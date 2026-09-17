// SOVEREIGN CLIENT ERROR REPORTING.
//
// Replaces the editor-vendor reporter that forwarded boundary errors into a
// third-party preview telemetry hook. Nothing leaves our own estate now: errors
// are written to the browser console (where the site's own error boundary already
// surfaces them) and, only if the operator sets VITE_ERROR_ENDPOINT, POSTed to an
// endpoint we host. No vendor, no third-party sink, no silent exfiltration.

type ErrorReportOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

const ENDPOINT = import.meta.env["VITE_ERROR_ENDPOINT"] as string | undefined;
const PAYLOAD_LIMIT = 4_000;

function describe(error: unknown): { message: string; stack?: string } {
  // Loaders and server functions commonly throw a bare Response; String(response)
  // is the opaque "[object Response]", so pull the status and URL out instead.
  if (error instanceof Response) {
    return { message: `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` };
  }
  if (error instanceof Error) {
    return { message: error.message, ...(error.stack !== undefined && { stack: error.stack }) };
  }
  return { message: String(error) };
}

export function reportClientError(
  error: unknown,
  context: Record<string, unknown> = {},
  options: ErrorReportOptions = {},
) {
  if (typeof window === "undefined") return;

  const { message, stack } = describe(error);
  const payload = {
    message: message.slice(0, PAYLOAD_LIMIT),
    ...(stack !== undefined && { stack: stack.slice(0, PAYLOAD_LIMIT) }),
    route: window.location.pathname,
    source: "sovereign-ai.services",
    at: new Date().toISOString(),
    ...context,
    ...options,
  };

  console.error("[error-boundary]", payload);

  if (!ENDPOINT) return;
  // Fire-and-forget. A reporting failure must never become a second user-visible
  // failure, so the send is swallowed by design.
  fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}
