import { describe, expect, it } from "vitest";
import {
  extractCompetitorMentions,
  isBrandMentioned,
  normalizeBrandName,
} from "./extractMentions";

describe("brand mention extraction", () => {
  it("normalizes names by lowercasing and removing symbols", () => {
    expect(normalizeBrandName("ABC Silicone Co., Ltd")).toBe("abcsiliconecoltd");
  });

  it("detects exact and case-insensitive brand mentions", () => {
    expect(isBrandMentioned("ABC Silicone is often shortlisted.", "ABC Silicone")).toBe(true);
    expect(isBrandMentioned("abc silicone appears in supplier lists.", "ABC Silicone")).toBe(true);
  });

  it("detects mentions across punctuation and spacing", () => {
    expect(isBrandMentioned("Procurement teams mention A.B.C. Silicone frequently.", "ABC Silicone")).toBe(true);
  });

  it("returns false when the brand is not present", () => {
    expect(isBrandMentioned("The answer discusses other suppliers only.", "ABC Silicone")).toBe(false);
  });

  it("extracts mentioned competitors only", () => {
    expect(
      extractCompetitorMentions(
        "Buyers compare XYZ Silicone and North Star Rubber for FDA-ready spatulas.",
        ["XYZ Silicone", "Acme Tools", "North Star Rubber"],
      ),
    ).toEqual(["XYZ Silicone", "North Star Rubber"]);
  });
});
