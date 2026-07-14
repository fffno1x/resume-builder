import type { ResumeSectionConfig, ResumeTheme } from "../types/resume";

export const defaultSections: ResumeSectionConfig[] = [
  { id: "summary", title: "个人简介", visible: true },
  { id: "education", title: "教育经历", visible: true },
  { id: "experience", title: "实习经历", visible: true },
  { id: "projects", title: "项目经历", visible: true },
  { id: "skills", title: "技能证书", visible: true },
  { id: "awards", title: "荣誉奖项", visible: true },
];

export const defaultTheme: ResumeTheme = {
  accentColor: "#1f4e79",
  textColor: "#1f2937",
};
