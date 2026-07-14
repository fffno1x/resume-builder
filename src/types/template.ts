import type { ResumeSectionId } from "./resume";

export type BoxSpacing = { top: number; right: number; bottom: number; left: number };
export type TemplateBinding = "name" | "title" | "contact" | "photo";
export type TemplateFontFamily = "Microsoft YaHei" | "SimSun" | "Arial" | "Georgia";

export type TextStyle = {
  fontSize: number;
  color: string;
  fontWeight: 400 | 500 | 600 | 700 | 800;
  textAlign: "left" | "center" | "right";
};

export type TemplateElement = {
  id: string;
  binding: TemplateBinding;
  x: number;
  y: number;
  width: number;
  height?: number;
  style: TextStyle;
};

export type TemplateColumn = {
  id: string;
  x: number;
  width: number;
  sectionIds: ResumeSectionId[];
  gap: number;
};

export type TemplateDecoration = {
  id: string;
  kind: "line" | "block";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export type TemplateTypography = {
  fontFamily: TemplateFontFamily;
  bodySize: number;
  lineHeight: number;
  sectionTitleSize: number;
  sectionTitleColor: string;
};

export type TemplateSchema = {
  id: string;
  name: string;
  version: 1;
  createdAt: string;
  page: { width: 210; height: 297; background: string; padding: BoxSpacing };
  header: TemplateElement[];
  columns: TemplateColumn[];
  decorations: TemplateDecoration[];
  typography: TemplateTypography;
};

export type TemplateSelection = "classic" | "compact" | "sidebar" | "ningde" | `custom:${string}`;
