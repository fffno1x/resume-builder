import { describe, expect, it } from "vitest";
import { createDefaultCustomTemplate, normalizeTemplateSchema } from "./templateSchema";

describe("template schema", () => {
  it("creates a single-column A4 template containing every resume section", () => {
    const template = createDefaultCustomTemplate("参考模板");

    expect(template.page).toMatchObject({ width: 210, height: 297 });
    expect(template.columns).toHaveLength(1);
    expect(template.columns[0].sectionIds).toEqual([
      "summary", "education", "experience", "projects", "skills", "awards",
    ]);
  });

  it("clamps unsafe AI output and removes unknown bindings", () => {
    const normalized = normalizeTemplateSchema({
      id: "unsafe id",
      name: "",
      version: 1,
      page: { width: 999, height: -4, background: "bad", padding: { top: -2, right: 99, bottom: 8, left: 8 } },
      header: [
        { id: "name", binding: "name", x: -20, y: 8, width: 400, style: { fontSize: 80, color: "red" } },
        { id: "script", binding: "script", x: 0, y: 0, width: 10, style: {} },
      ],
      columns: [{ id: "main", x: -10, width: 500, sectionIds: ["summary", "unknown"], gap: 99 }],
      decorations: [],
      typography: { fontFamily: "Comic Sans", bodySize: 40, lineHeight: 4, sectionTitleSize: 50, sectionTitleColor: "red" },
    });

    expect(normalized.page).toMatchObject({ width: 210, height: 297, background: "#ffffff" });
    expect(normalized.header).toHaveLength(1);
    expect(normalized.header[0]).toMatchObject({ x: 0, width: 210 });
    expect(normalized.columns[0].sectionIds).toEqual(["summary"]);
    expect(normalized.typography).toMatchObject({ fontFamily: "Microsoft YaHei", bodySize: 18, lineHeight: 2 });
  });
});
