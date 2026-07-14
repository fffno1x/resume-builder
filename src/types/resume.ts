export type ResumeData = {
  profile: {
    name: string;
    title: string;
    phone: string;
    email: string;
    city: string;
    website: string;
    photo: string;
    summary: string;
  };
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillGroup[];
  awards: TextItem[];
  sections: ResumeSectionConfig[];
  theme: ResumeTheme;
  keywordStyles: KeywordStyleRule[];
};

export type KeywordStyleRule = {
  keyword: string;
  bold: boolean;
  color: string;
  fontSize: number;
};

export type ResumeSectionId =
  | "summary"
  | "education"
  | "experience"
  | "projects"
  | "skills"
  | "awards";

export type ResumeSectionConfig = {
  id: ResumeSectionId;
  title: string;
  visible: boolean;
};

export type ResumeTheme = {
  accentColor: string;
  textColor: string;
};

export type EducationItem = {
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  details: string[];
};

export type ExperienceItem = {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  details: string[];
};

export type ProjectItem = {
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  details: string[];
};

export type SkillGroup = {
  name: string;
  items: string[];
};

export type TextItem = {
  title: string;
  description: string;
};

export type ResumeTemplate = "classic" | "compact" | "sidebar" | "ningde";
