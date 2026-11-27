export type TreatmentKnowledge = {
  slug: string;
  name: string;
  description: string;
  cardDescription?: string;
  price: string;
  priceLabel: string;
  packagePrice?: string;
  priceNote?: string;
  sessions?: string;
  duration?: string;
  downtime?: string;
  benefits?: string[];
};

export const normalizeSearchText = (value: string) => value
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();

export function buildTreatmentAliases(treatment: Pick<TreatmentKnowledge, "slug" | "name">): string[] {
  const name = normalizeSearchText(treatment.name);
  const slug = normalizeSearchText(treatment.slug);
  const withoutBrand = name.replace(/^(?:thera|aesthera)\s+/, "");
  const withoutGenericSuffix = withoutBrand.replace(/\b(?:facial|treatment|therapy|services?|protocol|program)\b/g, "").replace(/\s+/g, " ").trim();
  const genericWords = new Set(["hair", "removal", "facial", "treatment", "therapy", "service", "program", "protocol", "premium", "elite"]);
  const distinctiveTokens = treatment.name.match(/[A-Za-z0-9+]+/g)?.filter((token) =>
    (/^[A-Z0-9+]{3,}$/.test(token) || token.length >= 5) && !genericWords.has(token.toLowerCase()),
  ).map(normalizeSearchText) ?? [];
  return [...new Set([name, slug, withoutBrand, withoutGenericSuffix, ...distinctiveTokens].filter((value) => value.length >= 3))];
}
const editDistanceAtMostOne = (left: string, right: string) => {
  if (left === right) return true;
  if (Math.abs(left.length - right.length) > 1) return false;
  let changes = 0;
  for (let i = 0, j = 0; i < left.length && j < right.length;) {
    if (left[i] === right[j]) { i++; j++; continue; }
    if (++changes > 1) return false;
    if (left.length === right.length && left[i] === right[j + 1] && left[i + 1] === right[j]) { i += 2; j += 2; continue; }
    if (left.length > right.length) i++;
    else if (right.length > left.length) j++;
    else { i++; j++; }
  }
  return true;
};

export function treatmentMatchScore(query: string, searchable: string, aliases: string[] = []): number {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedSearchable = normalizeSearchText(searchable);
  if (!normalizedQuery) return 0;
  let score = 0;
  for (const alias of aliases) {
    if (alias && normalizedQuery.includes(alias)) score += Math.max(5, alias.split(" ").length * 3);
  }
  const ignored = new Set(["the", "and", "are", "what", "which", "how", "can", "you", "for", "does", "have", "about", "please", "price", "prices", "pricing", "magkano", "treatment", "service", "details", "benefits", "package", "sessions", "recovery", "downtime"]);
  const queryWords = normalizedQuery.split(" ").filter((word) => word.length >= 3 && !ignored.has(word));
  const searchableWords = new Set(normalizedSearchable.split(" ").filter((word) => word.length >= 3));
  for (const word of queryWords) {
    if (searchableWords.has(word)) score += 1;
    else if (word.length >= 5 && [...searchableWords].some((candidate) => candidate.length >= 5 && editDistanceAtMostOne(word, candidate))) score += 0.6;
  }
  return score;
}

export function buildTreatmentAnswer(treatment: TreatmentKnowledge): string {
  const lines = [
    `**${treatment.name}:** ${treatment.description}`,
    `**${treatment.priceLabel}: ${treatment.price}**`,
  ];
  if (treatment.packagePrice) lines.push(`**Package: ${treatment.packagePrice}**`);
  if (treatment.priceNote) lines.push(`**Price details:** ${treatment.priceNote}`);
  if (treatment.sessions) lines.push(`**Sessions:** ${treatment.sessions}`);
  if (treatment.duration) lines.push(`**Duration:** ${treatment.duration}`);
  if (treatment.downtime) lines.push(`**Preparation/recovery note:** ${treatment.downtime}`);
  if (treatment.benefits?.length) lines.push(`**Designed for:** ${treatment.benefits.join("; ")}`);
  lines.push("The clinic confirms the final treatment area, inclusions, price, and suitability before treatment.");
  return lines.join("\n");
}

