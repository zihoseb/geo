export function normalizeBrandName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function isBrandMentioned(answer: string, brandName: string) {
  const normalizedAnswer = normalizeBrandName(answer);
  const normalizedBrand = normalizeBrandName(brandName);

  if (!normalizedBrand) return false;
  return normalizedAnswer.includes(normalizedBrand);
}

export function extractCompetitorMentions(answer: string, competitors: string[]) {
  return competitors.filter((name) => isBrandMentioned(answer, name));
}
