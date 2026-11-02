import { describe, expect, it } from "vitest";
import { buildPilotOpening, digestCanonical, randomSalt } from "./pilot-seal";

const request = {
  email: "jane@example.org",
  name: "Jane Citizen",
  organisation: "Example Pty Ltd",
  tier: "team" as const,
  notes: "We run 40 agents.",
};

describe("pilot request seal", () => {
  it("the public fingerprint never contains the submitter's personal details", () => {
    const { digest } = buildPilotOpening(request, randomSalt(), "2026-11-02T06:00:00.000Z");
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
    expect(digest).not.toContain("jane");
  });

  it("the same request with a different secret gives a different public fingerprint", () => {
    const at = "2026-11-02T06:00:00.000Z";
    const a = buildPilotOpening(request, "a".repeat(64), at).digest;
    const b = buildPilotOpening(request, "b".repeat(64), at).digest;
    expect(a).not.toBe(b);
  });

  it("the private proof hashes back to the public fingerprint", () => {
    const { canonical, digest } = buildPilotOpening(request, randomSalt(), "2026-11-02T06:00:00.000Z");
    expect(digestCanonical(canonical)).toBe(digest);
    expect(JSON.parse(canonical).binding).toBe(false);
  });
});
