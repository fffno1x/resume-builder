import { describe, expect, it } from "vitest";
import type { KeywordStyleRule } from "../types/resume";
import { tokenizeKeywordStyles } from "./keywordStyles";

const rule = (keyword: string, fontSize = 14): KeywordStyleRule => ({
  keyword,
  bold: true,
  color: "#dc2626",
  fontSize,
});

describe("tokenizeKeywordStyles", () => {
  it("returns styled and plain ranges for every keyword occurrence", () => {
    expect(tokenizeKeywordStyles("React and React", [rule("React")])).toEqual([
      { text: "React", rule: rule("React") },
      { text: " and ", rule: null },
      { text: "React", rule: rule("React") },
    ]);
  });

  it("prefers the longest keyword at the same position", () => {
    const short = rule("Type");
    const long = rule("TypeScript", 16);

    expect(tokenizeKeywordStyles("TypeScript", [short, long])).toEqual([
      { text: "TypeScript", rule: long },
    ]);
  });

  it("ignores empty keywords", () => {
    expect(tokenizeKeywordStyles("React", [rule(""), rule("React")])).toEqual([
      { text: "React", rule: rule("React") },
    ]);
  });
});
