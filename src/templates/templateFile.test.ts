import { describe, expect, it } from "vitest";
import { validateTemplateFile } from "./templateFile";

describe("template reference files", () => {
  it("accepts PDF, PNG and JPEG files up to 10MB", () => {
    expect(() => validateTemplateFile(new File(["x"], "resume.pdf", { type: "application/pdf" }))).not.toThrow();
    expect(() => validateTemplateFile(new File(["x"], "resume.png", { type: "image/png" }))).not.toThrow();
    expect(() => validateTemplateFile(new File(["x"], "resume.jpg", { type: "image/jpeg" }))).not.toThrow();
  });

  it("rejects unsupported and oversized files", () => {
    expect(() => validateTemplateFile(new File(["x"], "resume.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }))).toThrow("PDF、PNG 或 JPG");
    const oversized = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "large.png", { type: "image/png" });
    expect(() => validateTemplateFile(oversized)).toThrow("10MB");
  });
});
