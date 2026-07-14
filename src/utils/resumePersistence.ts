import { defaultResume } from "../data/defaultResume";
import { defaultSections, defaultTheme } from "../data/resumeLayout";
import type { KeywordStyleRule, ResumeData, ResumeSectionConfig, ResumeTheme } from "../types/resume";

export const RESUME_STORAGE_KEY = "resume-builder:data";

type LoadResult = {
  data: ResumeData;
  source: "default" | "storage";
  error?: string;
};

export function serializeResume(data: ResumeData): string {
  return `${JSON.stringify(data, null, 2)}\n`;
}

export function parseResumeImport(rawJson: string): ResumeData {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error("请导入有效 JSON 文件。");
  }

  assertResumeData(parsed);
  return parsed;
}

export function loadResumeFromStorage(storage: Storage): LoadResult {
  const saved = storage.getItem(RESUME_STORAGE_KEY);

  if (!saved) {
    return { data: defaultResume, source: "default" };
  }

  try {
    const data = parseResumeImport(saved);
    return { data: isLegacyDemoResume(data) ? defaultResume : data, source: "storage" };
  } catch (error) {
    return {
      data: defaultResume,
      source: "default",
      error: error instanceof Error ? error.message : "本地简历数据无法读取。",
    };
  }
}

function isLegacyDemoResume(data: ResumeData) {
  return (
    data.profile.name === "李明" &&
    data.profile.phone === "138 0000 0000" &&
    data.profile.email === "liming@example.com"
  );
}

export function saveResumeToStorage(storage: Storage, data: ResumeData): void {
  storage.setItem(RESUME_STORAGE_KEY, serializeResume(data));
}

export function reorderItems<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const targetIndex = index + direction;

  if (index < 0 || index >= items.length || targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(index, 1);
  nextItems.splice(targetIndex, 0, movedItem);
  return nextItems;
}

function assertResumeData(value: unknown): asserts value is ResumeData {
  assertObject(value, "resume");

  assertObject(value.profile, "profile");
  assertString(value.profile.name, "profile.name");
  assertString(value.profile.title, "profile.title");
  assertString(value.profile.phone, "profile.phone");
  assertString(value.profile.email, "profile.email");
  assertString(value.profile.city, "profile.city");
  assertString(value.profile.website, "profile.website");
  if (value.profile.photo == null) {
    value.profile.photo = "";
  }
  assertString(value.profile.photo, "profile.photo");
  assertString(value.profile.summary, "profile.summary");

  assertArray(value.education, "education");
  value.education.forEach((item, index) => assertEducationItem(item, `education.${index}`));

  assertArray(value.experience, "experience");
  value.experience.forEach((item, index) => assertExperienceItem(item, `experience.${index}`));

  assertArray(value.projects, "projects");
  value.projects.forEach((item, index) => assertProjectItem(item, `projects.${index}`));

  assertArray(value.skills, "skills");
  value.skills.forEach((item, index) => assertSkillGroup(item, `skills.${index}`));

  assertArray(value.awards, "awards");
  value.awards.forEach((item, index) => assertTextItem(item, `awards.${index}`));

  value.sections = normalizeSections(value.sections);
  value.theme = normalizeTheme(value.theme);
  value.keywordStyles = normalizeKeywordStyles(value.keywordStyles);
}

function normalizeKeywordStyles(value: unknown): KeywordStyleRule[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const rule = item as Partial<KeywordStyleRule>;
    return [{
      keyword: typeof rule.keyword === "string" ? rule.keyword : "",
      bold: typeof rule.bold === "boolean" ? rule.bold : false,
      color: isHexColor(rule.color) ? rule.color : "#dc2626",
      fontSize: clampNumber(rule.fontSize, 8, 24, 12),
    }];
  });
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.round(value), min), max);
}

function normalizeSections(value: unknown): ResumeSectionConfig[] {
  if (!Array.isArray(value)) {
    return defaultSections;
  }

  const knownSections = new Set(defaultSections.map((section) => section.id));
  const byId = new Map(defaultSections.map((section) => [section.id, section]));
  const normalized: ResumeSectionConfig[] = [];

  value.forEach((item) => {
    if (typeof item !== "object" || item === null) return;
    const candidate = item as Partial<ResumeSectionConfig>;
    if (!candidate.id || !knownSections.has(candidate.id)) return;
    normalized.push({
      id: candidate.id,
      title: typeof candidate.title === "string" && candidate.title.trim() ? candidate.title : byId.get(candidate.id)!.title,
      visible: typeof candidate.visible === "boolean" ? candidate.visible : true,
    });
    byId.delete(candidate.id);
  });

  return [...normalized, ...byId.values()];
}

function normalizeTheme(value: unknown): ResumeTheme {
  if (typeof value !== "object" || value === null) {
    return defaultTheme;
  }

  const theme = value as Partial<ResumeTheme>;
  return {
    accentColor: isHexColor(theme.accentColor) ? theme.accentColor : defaultTheme.accentColor,
    textColor: isHexColor(theme.textColor) ? theme.textColor : defaultTheme.textColor,
  };
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function assertEducationItem(value: unknown, path: string) {
  assertObject(value, path);
  assertString(value.school, `${path}.school`);
  assertString(value.degree, `${path}.degree`);
  assertString(value.major, `${path}.major`);
  assertString(value.startDate, `${path}.startDate`);
  assertString(value.endDate, `${path}.endDate`);
  assertStringArray(value.details, `${path}.details`);
}

function assertExperienceItem(value: unknown, path: string) {
  assertObject(value, path);
  assertString(value.company, `${path}.company`);
  assertString(value.role, `${path}.role`);
  assertString(value.startDate, `${path}.startDate`);
  assertString(value.endDate, `${path}.endDate`);
  assertStringArray(value.details, `${path}.details`);
}

function assertProjectItem(value: unknown, path: string) {
  assertObject(value, path);
  assertString(value.name, `${path}.name`);
  assertString(value.role, `${path}.role`);
  assertString(value.startDate, `${path}.startDate`);
  assertString(value.endDate, `${path}.endDate`);
  assertStringArray(value.details, `${path}.details`);
}

function assertSkillGroup(value: unknown, path: string) {
  assertObject(value, path);
  assertString(value.name, `${path}.name`);
  assertStringArray(value.items, `${path}.items`);
}

function assertTextItem(value: unknown, path: string) {
  assertObject(value, path);
  assertString(value.title, `${path}.title`);
  assertString(value.description, `${path}.description`);
}

function assertObject(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`导入数据格式错误：${path} 必须是对象。`);
  }
}

function assertArray(value: unknown, path: string): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`导入数据格式错误：${path} 必须是数组。`);
  }
}

function assertString(value: unknown, path: string): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`导入数据格式错误：${path} 必须是文本。`);
  }
}

function assertStringArray(value: unknown, path: string) {
  assertArray(value, path);
  value.forEach((item, index) => assertString(item, `${path}.${index}`));
}
