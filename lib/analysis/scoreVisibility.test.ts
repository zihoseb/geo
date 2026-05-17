import { describe, expect, it } from "vitest";
import {
  calculateTechnicalScore,
  calculateVisibilityScore,
  getMentionRateScore,
} from "./scoreVisibility";

describe("visibility scoring", () => {
  it("maps mention rate thresholds to score bands", () => {
    expect(getMentionRateScore(0.6)).toBe(100);
    expect(getMentionRateScore(0.4)).toBe(80);
    expect(getMentionRateScore(0.2)).toBe(60);
    expect(getMentionRateScore(0.1)).toBe(40);
    expect(getMentionRateScore(0.05)).toBe(20);
  });

  it("calculates technical score from SEO signals", () => {
    expect(
      calculateTechnicalScore({
        hasTitle: true,
        hasMetaDescription: true,
        hasH1: true,
        hasSchema: true,
        hasSitemap: true,
        hasRobots: true,
        enoughText: true,
      }),
    ).toBe(100);

    expect(
      calculateTechnicalScore({
        hasTitle: true,
        hasMetaDescription: false,
        hasH1: true,
        hasSchema: false,
        enoughText: true,
      }),
    ).toBe(45);
  });

  it("calculates final MVP score with weighted mention, content, and technical scores", () => {
    expect(
      calculateVisibilityScore({
        mentionRate: 0.4,
        contentScore: 70,
        technicalScore: 50,
      }),
    ).toBe(71);
  });
});
