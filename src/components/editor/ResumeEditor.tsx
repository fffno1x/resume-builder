import type { ChangeEvent, Dispatch, ReactNode, SetStateAction } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type {
  EducationItem,
  ExperienceItem,
  ProjectItem,
  ResumeData,
  ResumeSectionConfig,
  SkillGroup,
  TextItem,
} from "../../types/resume";
import { reorderItems } from "../../utils/resumePersistence";

type ResumeEditorProps = {
  resume: ResumeData;
  setResume: Dispatch<SetStateAction<ResumeData>>;
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
};

const emptyEducation: EducationItem = {
  school: "",
  degree: "",
  major: "",
  startDate: "",
  endDate: "",
  details: [""],
};

const emptyExperience: ExperienceItem = {
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  details: [""],
};

const emptyProject: ProjectItem = {
  name: "",
  role: "",
  startDate: "",
  endDate: "",
  details: [""],
};

const emptySkill: SkillGroup = {
  name: "",
  items: [""],
};

const emptyAward: TextItem = {
  title: "",
  description: "",
};

export function ResumeEditor({ resume, setResume }: ResumeEditorProps) {
  const updateProfile = (key: keyof ResumeData["profile"], value: string) => {
    setResume((current) => ({
      ...current,
      profile: {
        ...current.profile,
        [key]: value,
      },
    }));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateProfile("photo", typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <EditorSection title="基本信息">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="姓名" value={resume.profile.name} onChange={(value) => updateProfile("name", value)} />
          <Field label="求职方向" value={resume.profile.title} onChange={(value) => updateProfile("title", value)} />
          <Field label="电话" value={resume.profile.phone} onChange={(value) => updateProfile("phone", value)} />
          <Field label="邮箱" value={resume.profile.email} onChange={(value) => updateProfile("email", value)} />
          <Field label="城市" value={resume.profile.city} onChange={(value) => updateProfile("city", value)} />
          <Field label="链接" value={resume.profile.website} onChange={(value) => updateProfile("website", value)} />
        </div>
        <div className="photo-upload-row">
          {resume.profile.photo ? (
            <img alt="简历照片预览" className="photo-upload-preview" src={resume.profile.photo} />
          ) : (
            <div className="photo-upload-placeholder">照片</div>
          )}
          <div className="space-y-2">
            <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-teal-400 hover:bg-teal-50">
              上传照片
              <input accept="image/*" className="hidden" onChange={handlePhotoChange} type="file" />
            </label>
            {resume.profile.photo ? (
              <button className="text-sm font-semibold text-slate-500 hover:text-red-600" onClick={() => updateProfile("photo", "")} type="button">
                清除照片
              </button>
            ) : null}
          </div>
        </div>
        <Field
          label="个人简介"
          multiline
          value={resume.profile.summary}
          onChange={(value) => updateProfile("summary", value)}
        />
      </EditorSection>

      <LayoutEditor resume={resume} setResume={setResume} />
      <KeywordStyleEditor resume={resume} setResume={setResume} />
      <EducationEditor resume={resume} setResume={setResume} />
      <ExperienceEditor resume={resume} setResume={setResume} />
      <ProjectEditor resume={resume} setResume={setResume} />
      <SkillEditor resume={resume} setResume={setResume} />
      <AwardEditor resume={resume} setResume={setResume} />
    </div>
  );
}

function KeywordStyleEditor({ resume, setResume }: ResumeEditorProps) {
  const addRule = () => {
    setResume((current) => ({
      ...current,
      keywordStyles: [
        ...current.keywordStyles,
        { keyword: "", bold: true, color: current.theme.accentColor, fontSize: 12 },
      ],
    }));
  };

  const updateRule = (index: number, patch: Partial<ResumeData["keywordStyles"][number]>) => {
    setResume((current) => ({
      ...current,
      keywordStyles: current.keywordStyles.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, ...patch } : rule,
      ),
    }));
  };

  return (
    <EditorSection title="关键词样式">
      <div className="space-y-2">
        {resume.keywordStyles.map((rule, index) => (
          <div className="keyword-style-row" key={index}>
            <input
              aria-label={`关键词 ${index + 1}`}
              className="keyword-input"
              onChange={(event) => updateRule(index, { keyword: event.target.value })}
              placeholder="输入关键词"
              value={rule.keyword}
            />
            <label className="keyword-toggle">
              <input
                checked={rule.bold}
                onChange={(event) => updateRule(index, { bold: event.target.checked })}
                type="checkbox"
              />
              加粗
            </label>
            <label className="keyword-color" title="关键词颜色">
              <span className="sr-only">关键词颜色 {index + 1}</span>
              <input
                aria-label={`关键词颜色 ${index + 1}`}
                onChange={(event) => updateRule(index, { color: event.target.value })}
                type="color"
                value={rule.color}
              />
            </label>
            <label className="keyword-size">
              <span>字号</span>
              <input
                aria-label={`关键词字号 ${index + 1}`}
                max={24}
                min={8}
                onChange={(event) => updateRule(index, { fontSize: Number(event.target.value) })}
                type="number"
                value={rule.fontSize}
              />
            </label>
            <button
              className="icon-button danger"
              onClick={() => setResume((current) => ({
                ...current,
                keywordStyles: current.keywordStyles.filter((_, ruleIndex) => ruleIndex !== index),
              }))}
              title="删除关键词规则"
              type="button"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
      <button className="add-button" onClick={addRule} type="button">
        <Plus size={16} />
        新增关键词
      </button>
    </EditorSection>
  );
}

function LayoutEditor({ resume, setResume }: ResumeEditorProps) {
  const updateTheme = (key: keyof ResumeData["theme"], value: string) => {
    setResume((current) => ({
      ...current,
      theme: {
        ...current.theme,
        [key]: value,
      },
    }));
  };

  const updateSection = (index: number, patch: Partial<ResumeSectionConfig>) => {
    setResume((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, ...patch } : section,
      ),
    }));
  };

  return (
    <EditorSection title="排版设置">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-600">
          主色
          <input
            className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white p-1"
            onChange={(event) => updateTheme("accentColor", event.target.value)}
            type="color"
            value={resume.theme.accentColor}
          />
        </label>
        <label className="block text-sm font-medium text-slate-600">
          文字色
          <input
            className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white p-1"
            onChange={(event) => updateTheme("textColor", event.target.value)}
            type="color"
            value={resume.theme.textColor}
          />
        </label>
      </div>
      <div className="space-y-2">
        {resume.sections.map((section, index) => (
          <div className="layout-row" key={section.id}>
            <input
              aria-label={`${section.title}板块名称`}
              className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              onChange={(event) => updateSection(index, { title: event.target.value })}
              value={section.title}
            />
            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input
                checked={section.visible}
                onChange={(event) => updateSection(index, { visible: event.target.checked })}
                type="checkbox"
              />
              显示
            </label>
            <button
              className="icon-button"
              disabled={index === 0}
              onClick={() =>
                setResume((current) => ({
                  ...current,
                  sections: reorderItems(current.sections, index, -1),
                }))
              }
              title="上移板块"
              type="button"
            >
              <ArrowUp size={15} />
            </button>
            <button
              className="icon-button"
              disabled={index === resume.sections.length - 1}
              onClick={() =>
                setResume((current) => ({
                  ...current,
                  sections: reorderItems(current.sections, index, 1),
                }))
              }
              title="下移板块"
              type="button"
            >
              <ArrowDown size={15} />
            </button>
          </div>
        ))}
      </div>
    </EditorSection>
  );
}

function EducationEditor({ resume, setResume }: ResumeEditorProps) {
  return (
    <ListSection
      addLabel="新增教育"
      title="教育经历"
      onAdd={() => setResume((current) => ({ ...current, education: [...current.education, emptyEducation] }))}
    >
      {resume.education.map((item, index) => (
        <ItemCard
          index={index}
          key={index}
          total={resume.education.length}
          title={item.school || "未命名教育经历"}
          onDelete={() =>
            setResume((current) => ({
              ...current,
              education: current.education.filter((_, itemIndex) => itemIndex !== index),
            }))
          }
          onMove={(direction) =>
            setResume((current) => ({
              ...current,
              education: reorderItems(current.education, index, direction),
            }))
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="学校" value={item.school} onChange={(value) => updateEducation(setResume, index, "school", value)} />
            <Field label="学历" value={item.degree} onChange={(value) => updateEducation(setResume, index, "degree", value)} />
            <Field label="专业" value={item.major} onChange={(value) => updateEducation(setResume, index, "major", value)} />
            <Field
              label="时间"
              value={`${item.startDate} - ${item.endDate}`}
              onChange={(value) => {
                const [startDate, endDate = ""] = splitRange(value);
                updateEducationRange(setResume, index, startDate, endDate);
              }}
            />
          </div>
          <Field
            label="经历要点"
            multiline
            value={linesToText(item.details)}
            onChange={(value) => updateEducation(setResume, index, "details", textToLines(value))}
          />
        </ItemCard>
      ))}
    </ListSection>
  );
}

function ExperienceEditor({ resume, setResume }: ResumeEditorProps) {
  return (
    <ListSection
      addLabel="新增经历"
      title="工作/实习经历"
      onAdd={() => setResume((current) => ({ ...current, experience: [...current.experience, emptyExperience] }))}
    >
      {resume.experience.map((item, index) => (
        <ItemCard
          index={index}
          key={index}
          total={resume.experience.length}
          title={item.company || "未命名经历"}
          onDelete={() =>
            setResume((current) => ({
              ...current,
              experience: current.experience.filter((_, itemIndex) => itemIndex !== index),
            }))
          }
          onMove={(direction) =>
            setResume((current) => ({
              ...current,
              experience: reorderItems(current.experience, index, direction),
            }))
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="公司" value={item.company} onChange={(value) => updateExperience(setResume, index, "company", value)} />
            <Field label="职位" value={item.role} onChange={(value) => updateExperience(setResume, index, "role", value)} />
            <Field label="开始时间" value={item.startDate} onChange={(value) => updateExperience(setResume, index, "startDate", value)} />
            <Field label="结束时间" value={item.endDate} onChange={(value) => updateExperience(setResume, index, "endDate", value)} />
          </div>
          <Field
            label="工作要点"
            multiline
            value={linesToText(item.details)}
            onChange={(value) => updateExperience(setResume, index, "details", textToLines(value))}
          />
        </ItemCard>
      ))}
    </ListSection>
  );
}

function ProjectEditor({ resume, setResume }: ResumeEditorProps) {
  return (
    <ListSection
      addLabel="新增项目"
      title="项目经历"
      onAdd={() => setResume((current) => ({ ...current, projects: [...current.projects, emptyProject] }))}
    >
      {resume.projects.map((item, index) => (
        <ItemCard
          index={index}
          key={index}
          total={resume.projects.length}
          title={item.name || "未命名项目"}
          onDelete={() =>
            setResume((current) => ({
              ...current,
              projects: current.projects.filter((_, itemIndex) => itemIndex !== index),
            }))
          }
          onMove={(direction) =>
            setResume((current) => ({
              ...current,
              projects: reorderItems(current.projects, index, direction),
            }))
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="项目名称" value={item.name} onChange={(value) => updateProject(setResume, index, "name", value)} />
            <Field label="角色" value={item.role} onChange={(value) => updateProject(setResume, index, "role", value)} />
            <Field label="开始时间" value={item.startDate} onChange={(value) => updateProject(setResume, index, "startDate", value)} />
            <Field label="结束时间" value={item.endDate} onChange={(value) => updateProject(setResume, index, "endDate", value)} />
          </div>
          <Field
            label="项目要点"
            multiline
            value={linesToText(item.details)}
            onChange={(value) => updateProject(setResume, index, "details", textToLines(value))}
          />
        </ItemCard>
      ))}
    </ListSection>
  );
}

function SkillEditor({ resume, setResume }: ResumeEditorProps) {
  return (
    <ListSection
      addLabel="新增技能"
      title="技能"
      onAdd={() => setResume((current) => ({ ...current, skills: [...current.skills, emptySkill] }))}
    >
      {resume.skills.map((item, index) => (
        <ItemCard
          index={index}
          key={index}
          total={resume.skills.length}
          title={item.name || "未命名技能"}
          onDelete={() =>
            setResume((current) => ({
              ...current,
              skills: current.skills.filter((_, itemIndex) => itemIndex !== index),
            }))
          }
          onMove={(direction) =>
            setResume((current) => ({
              ...current,
              skills: reorderItems(current.skills, index, direction),
            }))
          }
        >
          <Field label="分类" value={item.name} onChange={(value) => updateSkill(setResume, index, "name", value)} />
          <Field
            label="技能项"
            value={item.items.join("，")}
            onChange={(value) => updateSkill(setResume, index, "items", splitComma(value))}
          />
        </ItemCard>
      ))}
    </ListSection>
  );
}

function AwardEditor({ resume, setResume }: ResumeEditorProps) {
  return (
    <ListSection
      addLabel="新增证书"
      title="证书/奖项"
      onAdd={() => setResume((current) => ({ ...current, awards: [...current.awards, emptyAward] }))}
    >
      {resume.awards.map((item, index) => (
        <ItemCard
          index={index}
          key={index}
          total={resume.awards.length}
          title={item.title || "未命名证书/奖项"}
          onDelete={() =>
            setResume((current) => ({
              ...current,
              awards: current.awards.filter((_, itemIndex) => itemIndex !== index),
            }))
          }
          onMove={(direction) =>
            setResume((current) => ({
              ...current,
              awards: reorderItems(current.awards, index, direction),
            }))
          }
        >
          <Field label="名称" value={item.title} onChange={(value) => updateAward(setResume, index, "title", value)} />
          <Field
            label="说明"
            multiline
            value={item.description}
            onChange={(value) => updateAward(setResume, index, "description", value)}
          />
        </ItemCard>
      ))}
    </ListSection>
  );
}

function EditorSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="editor-section">
      <h2 className="section-heading">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function ListSection({
  addLabel,
  children,
  onAdd,
  title,
}: {
  addLabel: string;
  children: ReactNode;
  onAdd: () => void;
  title: string;
}) {
  return (
    <EditorSection title={title}>
      <div className="space-y-3">{children}</div>
      <button className="add-button" onClick={onAdd} type="button">
        <Plus size={16} />
        {addLabel}
      </button>
    </EditorSection>
  );
}

function ItemCard({
  children,
  index,
  onDelete,
  onMove,
  title,
  total,
}: {
  children: ReactNode;
  index: number;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
  title: string;
  total: number;
}) {
  return (
    <article className="item-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="min-w-0 truncate text-sm font-semibold text-slate-800">{title}</h3>
        <div className="flex shrink-0 items-center gap-1">
          <button
            className="icon-button"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            title="上移"
            type="button"
          >
            <ArrowUp size={15} />
            <span className="sr-only">上移</span>
          </button>
          <button
            className="icon-button"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            title="下移"
            type="button"
          >
            <ArrowDown size={15} />
            <span className="sr-only">下移</span>
          </button>
          <button className="icon-button danger" onClick={onDelete} title="删除" type="button">
            <Trash2 size={15} />
            <span className="sr-only">删除</span>
          </button>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </article>
  );
}

function Field({ label, multiline, onChange, value }: FieldProps) {
  const id = label;
  const inputClass =
    "mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

  return (
    <label className="block text-sm font-medium text-slate-600">
      {label}
      {multiline ? (
        <textarea
          className={`${inputClass} min-h-[96px] resize-y`}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      ) : (
        <input
          className={inputClass}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          type="text"
          value={value}
        />
      )}
    </label>
  );
}

function updateEducation<K extends keyof EducationItem>(
  setResume: Dispatch<SetStateAction<ResumeData>>,
  index: number,
  key: K,
  value: EducationItem[K],
) {
  setResume((current) => ({
    ...current,
    education: current.education.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item,
    ),
  }));
}

function updateEducationRange(
  setResume: Dispatch<SetStateAction<ResumeData>>,
  index: number,
  startDate: string,
  endDate: string,
) {
  setResume((current) => ({
    ...current,
    education: current.education.map((item, itemIndex) =>
      itemIndex === index ? { ...item, startDate, endDate } : item,
    ),
  }));
}

function updateExperience<K extends keyof ExperienceItem>(
  setResume: Dispatch<SetStateAction<ResumeData>>,
  index: number,
  key: K,
  value: ExperienceItem[K],
) {
  setResume((current) => ({
    ...current,
    experience: current.experience.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item,
    ),
  }));
}

function updateProject<K extends keyof ProjectItem>(
  setResume: Dispatch<SetStateAction<ResumeData>>,
  index: number,
  key: K,
  value: ProjectItem[K],
) {
  setResume((current) => ({
    ...current,
    projects: current.projects.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item,
    ),
  }));
}

function updateSkill<K extends keyof SkillGroup>(
  setResume: Dispatch<SetStateAction<ResumeData>>,
  index: number,
  key: K,
  value: SkillGroup[K],
) {
  setResume((current) => ({
    ...current,
    skills: current.skills.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item,
    ),
  }));
}

function updateAward<K extends keyof TextItem>(
  setResume: Dispatch<SetStateAction<ResumeData>>,
  index: number,
  key: K,
  value: TextItem[K],
) {
  setResume((current) => ({
    ...current,
    awards: current.awards.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item,
    ),
  }));
}

function linesToText(lines: string[]) {
  return lines.join("\n");
}

function textToLines(value: string) {
  const lines = value.split("\n").map((line) => line.trim());
  return lines.length ? lines : [""];
}

function splitComma(value: string) {
  return value
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitRange(value: string): [string, string] {
  const [startDate = "", endDate = ""] = value.split(/\s*[-–—]\s*/);
  return [startDate.trim(), endDate.trim()];
}
