export function getMentionRateScore(mentionRate: number) {
  if (mentionRate >= 0.6) return 100;
  if (mentionRate >= 0.4) return 80;
  if (mentionRate >= 0.2) return 60;
  if (mentionRate >= 0.1) return 40;
  return 20;
}

export function calculateTechnicalScore(input: {
  hasTitle: boolean;
  hasMetaDescription: boolean;
  hasH1: boolean;
  hasSchema: boolean;
  hasSitemap?: boolean;
  hasRobots?: boolean;
  enoughText: boolean;
}) {
  let score = 0;
  if (input.hasTitle) score += 15;
  if (input.hasMetaDescription) score += 15;
  if (input.hasH1) score += 15;
  if (input.hasSchema) score += 20;
  if (input.hasSitemap) score += 10;
  if (input.hasRobots) score += 10;
  if (input.enoughText) score += 15;
  return Math.min(score, 100);
}

export function calculateVisibilityScore(input: {
  mentionRate: number;
  contentScore: number;
  technicalScore: number;
}) {
  const mentionRateScore = getMentionRateScore(input.mentionRate);
  return Math.round(
    mentionRateScore * 0.45 + input.contentScore * 0.35 + input.technicalScore * 0.2,
  );
}
