/**
 * The Constitution of the AI Era — canonical form.
 *
 * Browser-safe. The digest computed here is the same digest computed on the
 * server and the same digest a third party can recompute from the published
 * JSON. A constitution is only written once — but it can be updated forever,
 * and every update is provable because of this file.
 */
import { sha256 } from "@noble/hashes/sha2.js";
import { ARTICLES, ARTICLES_V1, type Article } from "@/content/nation";

export const CONSTITUTION_NAME = "The Constitution of the AI Era";
export const CONSTITUTION_TAGLINE =
  "A constitution is only written once — but it can be updated forever.";
export const CHARTER_DISPLAY_NAME = "The Protocol Charter of the AI Era";
export const CHARTER_DISPLAY_TAGLINE =
  "A charter is only written once — but it can be updated forever.";
export const CONSTITUTION_ISSUER = "sovereign-ai.services";
export const CONSTITUTION_V1_EFFECTIVE = "2026-08-06T00:00:00.000Z";
export const CONSTITUTION_V2_EFFECTIVE = "2026-09-03T00:00:00.000Z";

/** The version whose text this deployment serves. */
export const CHARTER_CURRENT_VERSION = 2;

/**
 * Article text is version-scoped. A digest printed on the page is always the
 * digest of the text of that version, so an amendment can never be published
 * while an older digest is displayed as though it still matched.
 */
export function articlesForVersion(version: number): readonly Article[] {
  return version <= 1 ? ARTICLES_V1 : ARTICLES;
}


export type CanonicalArticle = {
  numeral: string;
  slug: string;
  name: string;
  right: string;
  thesis: string;
  body: string[];
  guarantees: string[];
};

export type CanonicalConstitution = {
  name: string;
  tagline: string;
  issuer: string;
  version: number;
  articles: CanonicalArticle[];
};

const hex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export function canonicalArticles(articles: readonly Article[] = ARTICLES): CanonicalArticle[] {
  return articles.map((a) => ({
    numeral: a.numeral,
    slug: a.slug,
    name: a.name,
    right: a.right,
    thesis: a.thesis,
    body: [...a.body],
    guarantees: [...a.guarantees],
  }));
}

export function canonicalConstitution(
  version = CHARTER_CURRENT_VERSION,
  articles: readonly Article[] = articlesForVersion(version),
): CanonicalConstitution {

  return {
    name: CONSTITUTION_NAME,
    tagline: CONSTITUTION_TAGLINE,
    issuer: CONSTITUTION_ISSUER,
    version,
    articles: canonicalArticles(articles),
  };
}

/** RFC 8785-style: keys emitted in a fixed, documented order, no whitespace. */
export function canonicalString(doc: CanonicalConstitution): string {
  return JSON.stringify({
    articles: doc.articles.map((a) => ({
      body: a.body,
      guarantees: a.guarantees,
      name: a.name,
      numeral: a.numeral,
      right: a.right,
      slug: a.slug,
      thesis: a.thesis,
    })),
    issuer: doc.issuer,
    name: doc.name,
    tagline: doc.tagline,
    version: doc.version,
  });
}

export function constitutionDigest(doc: CanonicalConstitution): string {
  return hex(sha256(new TextEncoder().encode(canonicalString(doc))));
}

/** Digest of a single article, so an agent can cite one clause by hash. */
export function articleDigest(article: CanonicalArticle, version: number): string {
  const canonical = JSON.stringify({
    body: article.body,
    guarantees: article.guarantees,
    issuer: CONSTITUTION_ISSUER,
    name: article.name,
    numeral: article.numeral,
    right: article.right,
    slug: article.slug,
    thesis: article.thesis,
    version,
  });
  return hex(sha256(new TextEncoder().encode(canonical)));
}

/**
 * Digest of an Article's TEXT alone, with no version number in the input.
 *
 * articleDigest() is version-scoped, so the same words hash differently at v1
 * and v2 by construction. This digest is what a reader uses to prove that an
 * Article was carried forward unchanged across an amendment.
 */
export function articleTextDigest(article: CanonicalArticle): string {
  const canonical = JSON.stringify({
    body: article.body,
    guarantees: article.guarantees,
    issuer: CONSTITUTION_ISSUER,
    name: article.name,
    numeral: article.numeral,
    right: article.right,
    slug: article.slug,
    thesis: article.thesis,
  });
  return hex(sha256(new TextEncoder().encode(canonical)));
}


export function articleUri(slug: string) {
  return `https://sovereign-ai.services/charter#${slug}`;
}

export const AMENDMENT_THRESHOLDS: Record<string, { rule: string; detail: string }> = {
  I: {
    rule: "Unanimity",
    detail: "Article I may only change with the unanimous ratification of all active workspaces.",
  },
  II: { rule: "Two-thirds", detail: "Two-thirds of ratifying citizens, fourteen-day deliberation." },
  III: {
    rule: "Two-thirds",
    detail: "Two-thirds of ratifying citizens, fourteen-day deliberation.",
  },
  IV: { rule: "Two-thirds", detail: "Two-thirds of ratifying citizens, fourteen-day deliberation." },
  V: {
    rule: "Unanimity",
    detail: "Article V may only change with the unanimous ratification of all active workspaces.",
  },
};

export const DELIBERATION_DAYS = 14;
