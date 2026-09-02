import { ARTICLES, ARTICLES_V1 } from "@/content/nation";
import { canonicalArticles, canonicalConstitution, constitutionDigest, articleDigest, articleTextDigest } from "@/lib/constitution";
const a1 = canonicalArticles(ARTICLES_V1), a2 = canonicalArticles(ARTICLES);
const out: any = { charter_v1: constitutionDigest(canonicalConstitution(1)), charter_v2: constitutionDigest(canonicalConstitution(2)), articles: [] as any[] };
for (let i = 0; i < 5; i++) out.articles.push({
  numeral: a2[i]!.numeral,
  text_v1: articleTextDigest(a1[i]!),
  text_v2: articleTextDigest(a2[i]!),
  text_identical: articleTextDigest(a1[i]!) === articleTextDigest(a2[i]!),
  versioned_v1: articleDigest(a1[i]!, 1),
  versioned_v2: articleDigest(a2[i]!, 2),
});
console.log(JSON.stringify(out, null, 2));
