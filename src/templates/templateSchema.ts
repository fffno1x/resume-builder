import type { ResumeSectionId } from "../types/resume";
import type {
  BoxSpacing,
  TemplateBinding,
  TemplateColumn,
  TemplateDecoration,
  TemplateElement,
  TemplateFontFamily,
  TemplateSchema,
  TextStyle,
} from "../types/template";

const sectionIds: ResumeSectionId[] = ["summary", "education", "experience", "projects", "skills", "awards"];
const bindings: TemplateBinding[] = ["name", "title", "contact", "photo"];
const fontFamilies: TemplateFontFamily[] = ["Microsoft YaHei", "SimSun", "Arial", "Georgia"];

export function createDefaultCustomTemplate(name = "我的模板"): TemplateSchema {
  return {
    id: createId(), name, version: 1, createdAt: new Date().toISOString(),
    page: { width: 210, height: 297, background: "#ffffff", padding: { top: 10, right: 14, bottom: 10, left: 14 } },
    header: [
      { id: "name", binding: "name", x: 14, y: 10, width: 150, style: textStyle(26, "#1f2937", 800) },
      { id: "title", binding: "title", x: 14, y: 22, width: 150, style: textStyle(11, "#1f4e79", 700) },
      { id: "contact", binding: "contact", x: 14, y: 31, width: 150, style: textStyle(9, "#475569", 400) },
      { id: "photo", binding: "photo", x: 172, y: 10, width: 24, height: 30, style: textStyle(10, "#1f2937", 400) },
    ],
    columns: [{ id: "main", x: 14, width: 182, sectionIds: [...sectionIds], gap: 4 }],
    decorations: [{ id: "header-line", kind: "line", x: 14, y: 44, width: 182, height: 0.6, color: "#1f4e79" }],
    typography: { fontFamily: "Microsoft YaHei", bodySize: 10, lineHeight: 1.45, sectionTitleSize: 12, sectionTitleColor: "#1f4e79" },
  };
}

export function normalizeTemplateSchema(value: unknown): TemplateSchema {
  const base = createDefaultCustomTemplate();
  if (!isRecord(value)) return base;
  const page = isRecord(value.page) ? value.page : {};
  const typography = isRecord(value.typography) ? value.typography : {};
  const rawHeader = Array.isArray(value.header) ? value.header.slice(0, 8) : base.header;
  const rawColumns = Array.isArray(value.columns) ? value.columns.slice(0, 2) : base.columns;
  const rawDecorations = Array.isArray(value.decorations) ? value.decorations.slice(0, 20) : [];

  const header = rawHeader.flatMap((item): TemplateElement[] => {
    if (!isRecord(item) || !bindings.includes(item.binding as TemplateBinding)) return [];
    const style = isRecord(item.style) ? item.style : {};
    return [{
      id: safeId(item.id, String(item.binding)), binding: item.binding as TemplateBinding,
      x: clampNumber(item.x, 0, 210, 0), y: clampNumber(item.y, 0, 80, 0),
      width: clampNumber(item.width, 8, 210, 40),
      ...(item.height == null ? {} : { height: clampNumber(item.height, 8, 80, 24) }),
      style: normalizeTextStyle(style),
    }];
  });

  const columns = rawColumns.flatMap((item, index): TemplateColumn[] => {
    if (!isRecord(item)) return [];
    const ids = Array.isArray(item.sectionIds)
      ? item.sectionIds.filter((id): id is ResumeSectionId => sectionIds.includes(id as ResumeSectionId))
      : [];
    return [{ id: safeId(item.id, `column-${index + 1}`), x: clampNumber(item.x, 0, 202, 14), width: clampNumber(item.width, 30, 210, 182), sectionIds: [...new Set(ids)], gap: clampNumber(item.gap, 0, 12, 4) }];
  });

  const decorations = rawDecorations.flatMap((item, index): TemplateDecoration[] => {
    if (!isRecord(item) || (item.kind !== "line" && item.kind !== "block")) return [];
    return [{ id: safeId(item.id, `decoration-${index + 1}`), kind: item.kind, x: clampNumber(item.x, 0, 210, 0), y: clampNumber(item.y, 0, 297, 0), width: clampNumber(item.width, 0.2, 210, 10), height: clampNumber(item.height, 0.2, 297, 1), color: normalizeColor(item.color, "#1f4e79") }];
  });

  return {
    id: safeId(value.id, base.id), name: safeName(value.name, "我的模板"), version: 1,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : base.createdAt,
    page: { width: 210, height: 297, background: normalizeColor(page.background, "#ffffff"), padding: normalizeSpacing(page.padding, base.page.padding) },
    header: header.length ? header : base.header,
    columns: columns.length ? columns : base.columns,
    decorations,
    typography: {
      fontFamily: fontFamilies.includes(typography.fontFamily as TemplateFontFamily) ? typography.fontFamily as TemplateFontFamily : "Microsoft YaHei",
      bodySize: clampNumber(typography.bodySize, 7, 18, 10), lineHeight: clampNumber(typography.lineHeight, 1, 2, 1.45),
      sectionTitleSize: clampNumber(typography.sectionTitleSize, 8, 24, 12), sectionTitleColor: normalizeColor(typography.sectionTitleColor, "#1f4e79"),
    },
  };
}

export function serializeTemplate(template: TemplateSchema) { return `${JSON.stringify(template, null, 2)}\n`; }
export function parseTemplate(raw: string) { return normalizeTemplateSchema(JSON.parse(raw) as unknown); }
export function cloneTemplate(template: TemplateSchema): TemplateSchema {
  return { ...structuredClone(template), id: createId(), name: `${template.name} 副本`, createdAt: new Date().toISOString() };
}

function normalizeTextStyle(value: Record<string, unknown>): TextStyle {
  const weight = clampNumber(value.fontWeight, 400, 800, 400);
  const allowedWeights = [400, 500, 600, 700, 800] as const;
  return { fontSize: clampNumber(value.fontSize, 7, 36, 11), color: normalizeColor(value.color, "#1f2937"), fontWeight: allowedWeights.reduce((best, item) => Math.abs(item - weight) < Math.abs(best - weight) ? item : best), textAlign: value.textAlign === "center" || value.textAlign === "right" ? value.textAlign : "left" };
}
function textStyle(fontSize: number, color: string, fontWeight: TextStyle["fontWeight"]): TextStyle { return { fontSize, color, fontWeight, textAlign: "left" }; }
function normalizeSpacing(value: unknown, fallback: BoxSpacing): BoxSpacing { const item = isRecord(value) ? value : {}; return { top: clampNumber(item.top, 0, 40, fallback.top), right: clampNumber(item.right, 0, 40, fallback.right), bottom: clampNumber(item.bottom, 0, 40, fallback.bottom), left: clampNumber(item.left, 0, 40, fallback.left) }; }
function normalizeColor(value: unknown, fallback: string) { return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback; }
function clampNumber(value: unknown, min: number, max: number, fallback: number) { return typeof value === "number" && Number.isFinite(value) ? Math.min(Math.max(value, min), max) : fallback; }
function safeName(value: unknown, fallback: string) { return typeof value === "string" && value.trim() ? value.trim().slice(0, 40) : fallback; }
function safeId(value: unknown, fallback: string) { const clean = typeof value === "string" ? value.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 60) : ""; return clean || fallback; }
function createId() { return globalThis.crypto?.randomUUID?.() ?? `template-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
