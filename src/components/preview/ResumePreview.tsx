import { Link as LinkIcon, Mail, MapPin, Phone } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { KeywordStyleRule, ResumeData, ResumeSectionConfig, ResumeSectionId, ResumeTemplate } from "../../types/resume";
import type { TemplateSchema, TemplateSelection } from "../../types/template";
import { tokenizeKeywordStyles } from "../../utils/keywordStyles";

type ResumePreviewProps = {
  data: ResumeData;
  template: TemplateSelection;
  customTemplate?: TemplateSchema | null;
};

type TimelineItemProps = {
  details: string[];
  meta: string;
  rules: KeywordStyleRule[];
  role: string;
  title: string;
  variant?: "default" | "row";
};

type TemplateProps = {
  data: ResumeData;
  sections: ResumeSectionConfig[];
};

const templateTestIds: Record<ResumeTemplate, string> = {
  classic: "classic",
  compact: "compact",
  ningde: "ningde",
  sidebar: "sidebar",
};

const baseFit = {
  scale: 1,
  gapScale: 1,
  blockScale: 1,
  mode: "normal",
};

export function ResumePreview({ customTemplate, data, template }: ResumePreviewProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(baseFit);
  const [previewScale, setPreviewScale] = useState(1);
  const [overflowing, setOverflowing] = useState(false);
  const sections = useMemo(() => data.sections.filter((section) => section.visible), [data.sections]);
  const density = getSmartDensity(data);
  const isCustom = template.startsWith("custom:") && customTemplate;

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const page = pageRef.current;
    if (!stage || !page) return;

    const measurePreview = () => {
      const computed = getComputedStyle(stage);
      const horizontalPadding = parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight);
      const availableWidth = Math.max(stage.clientWidth - horizontalPadding, 1);
      setPreviewScale(clamp(availableWidth / page.offsetWidth, 0.24, 1));
    };

    measurePreview();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measurePreview);
      return () => window.removeEventListener("resize", measurePreview);
    }

    const observer = new ResizeObserver(measurePreview);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const page = pageRef.current;
    const content = contentRef.current;
    if (!page || !content) return;

    let frame = 0;

    const measure = () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const pageHeight = page.clientHeight;
        const columnHeights = Array.from(content.querySelectorAll<HTMLElement>(".schema-column")).map((column) => column.scrollHeight);
        const contentHeight = columnHeights.length
          ? 50 * (page.clientWidth / 210) + Math.max(...columnHeights)
          : content.scrollHeight;
        if (!pageHeight || !contentHeight) return;

        const targetContentHeight = pageHeight * 0.96;
        const ratio = targetContentHeight / contentHeight;
        const computed = getComputedStyle(page);
        const currentScale = Number(computed.getPropertyValue("--fit-scale")) || 1;
        const currentGapScale = Number(computed.getPropertyValue("--fit-gap-scale")) || 1;
        setOverflowing(ratio < 0.99 && currentScale <= 0.765 && currentGapScale <= 0.6);

        setFit((current) => {
          const nextFit =
            ratio > 1.02
              ? {
                  scale: clamp(current.scale * ratio * 0.985, 0.82, 1.24),
                  gapScale: clamp(current.gapScale * ratio, 0.64, 2.1),
                  blockScale: clamp(current.blockScale * ratio * 0.95, 0.7, 1.48),
                  mode: "expand",
                }
              : ratio < 0.99
                ? {
                    scale: clamp(current.scale * ratio * 0.995, 0.76, 1.24),
                    gapScale: clamp(current.gapScale * ratio, 0.58, 2.1),
                    blockScale: clamp(current.blockScale * ratio, 0.66, 1.48),
                    mode: "compress",
                  }
                : {
                    ...current,
                    mode: "normal",
                  };

          return isSameFit(current, nextFit) ? current : nextFit;
        });
      });
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", measure);
      };
    }

    const observer = new ResizeObserver(measure);
    observer.observe(content);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [data, template]);

  const style = {
    "--resume-accent": data.theme.accentColor,
    "--resume-text": data.theme.textColor,
    "--fit-scale": fit.scale,
    "--fit-gap-scale": fit.gapScale,
    "--fit-block-scale": fit.blockScale,
  } as CSSProperties;

  return (
    <div className="resume-stage" ref={stageRef}>
      <div className="resume-page-shell" style={{ "--preview-scale": previewScale } as CSSProperties}>
        <article
          className={`resume-page smart-density-${density} template-${template}`}
          data-testid="resume-preview"
          ref={pageRef}
          style={style}
        >
          <div className="resume-fit-content" ref={contentRef}>
            {template === "classic" ? <ClassicTemplate data={data} sections={sections} /> : null}
            {template === "compact" ? <CompactTemplate data={data} sections={sections} /> : null}
            {template === "sidebar" ? <SidebarTemplate data={data} sections={sections} /> : null}
            {template === "ningde" ? <NingdeTemplate data={data} sections={sections} /> : null}
            {isCustom ? <SchemaTemplate data={data} schema={customTemplate} sections={sections} /> : null}
          </div>
        </article>
      </div>
      {overflowing ? <div className="resume-overflow-warning" role="status">内容过多，已达到最小压缩，请精简内容或调整栏位。</div> : null}
    </div>
  );
}

function SchemaTemplate({ data, schema, sections }: TemplateProps & { schema: TemplateSchema }) {
  const byId = new Map(sections.map((section) => [section.id, section]));
  return (
    <div
      className="resume-template schema-template"
      data-testid="resume-template-custom"
      style={{
        background: schema.page.background,
        fontFamily: schema.typography.fontFamily,
        fontSize: `calc(${schema.typography.bodySize}px * var(--fit-scale))`,
        lineHeight: schema.typography.lineHeight,
      }}
    >
      {schema.decorations.map((item) => (
        <span className="schema-decoration" key={item.id} style={{ background: item.color, height: `${item.height}mm`, left: `${item.x}mm`, top: `${item.y}mm`, width: `${item.width}mm` }} />
      ))}
      {schema.header.map((element) => (
        <div className={`schema-header-element schema-${element.binding}`} key={element.id} style={{ color: element.style.color, fontSize: `${element.style.fontSize}px`, fontWeight: element.style.fontWeight, height: element.height ? `${element.height}mm` : undefined, left: `${element.x}mm`, textAlign: element.style.textAlign, top: `${element.y}mm`, width: `${element.width}mm` }}>
          {element.binding === "name" ? <StyledText rules={data.keywordStyles} text={data.profile.name || "姓名"} /> : null}
          {element.binding === "title" ? <><span className="job-intention-label">求职意向：</span><StyledText rules={data.keywordStyles} text={data.profile.title || "求职方向"} /></> : null}
          {element.binding === "contact" ? <ContactLine data={data} /> : null}
          {element.binding === "photo" ? <ProfilePhoto className="schema-photo" src={data.profile.photo} /> : null}
        </div>
      ))}
      <div className="schema-columns">
        {schema.columns.map((column) => (
          <div className="schema-column" key={column.id} style={{ gap: `${column.gap}mm`, left: `${column.x}mm`, width: `${column.width}mm` }}>
            {column.sectionIds.map((id) => byId.get(id)).filter((item): item is ResumeSectionConfig => Boolean(item)).map((section) => (
              <div className="schema-section" key={section.id} style={{ "--schema-title-color": schema.typography.sectionTitleColor, "--schema-title-size": `${schema.typography.sectionTitleSize}px` } as CSSProperties}>
                <SectionRenderer data={data} section={section} variant="classic" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassicTemplate({ data, sections }: TemplateProps) {
  return (
    <div className="resume-template classic-template" data-testid={`resume-template-${templateTestIds.classic}`}>
      <header className="classic-header">
        <div className="classic-title-block">
          <h2><StyledText rules={data.keywordStyles} text={data.profile.name || "姓名"} /></h2>
          <p><span className="job-intention-label">求职意向：</span><StyledText rules={data.keywordStyles} text={data.profile.title || "求职方向"} /></p>
          <ContactLine data={data} />
        </div>
        <ProfilePhoto className="classic-photo" src={data.profile.photo} />
      </header>

      <div className="resume-sections">
        {sections.map((section) => (
          <SectionRenderer data={data} key={section.id} section={section} variant="classic" />
        ))}
      </div>
    </div>
  );
}

function CompactTemplate({ data, sections }: TemplateProps) {
  return (
    <div className="resume-template compact-template" data-testid={`resume-template-${templateTestIds.compact}`}>
      <header className="compact-header">
        <div>
          <h2><StyledText rules={data.keywordStyles} text={data.profile.name || "姓名"} /></h2>
          <p><span className="job-intention-label">求职意向：</span><StyledText rules={data.keywordStyles} text={data.profile.title || "求职方向"} /></p>
        </div>
        <div className="compact-contact">
          <ContactLine data={data} />
        </div>
        <ProfilePhoto className="compact-photo" src={data.profile.photo} />
      </header>

      <div className="resume-sections compact-sections">
        {sections.map((section) => (
          <SectionRenderer data={data} key={section.id} section={section} variant="compact" />
        ))}
      </div>
    </div>
  );
}

function SidebarTemplate({ data, sections }: TemplateProps) {
  return (
    <div className="resume-template sidebar-template" data-testid={`resume-template-${templateTestIds.sidebar}`}>
      <aside className="sidebar-rail">
        <ProfilePhoto className="sidebar-photo" src={data.profile.photo} />
        <h2><StyledText rules={data.keywordStyles} text={data.profile.name || "姓名"} /></h2>
        <p className="sidebar-title"><span className="job-intention-label">求职意向：</span><StyledText rules={data.keywordStyles} text={data.profile.title || "求职方向"} /></p>
        <ContactStack data={data} />
      </aside>

      <main className="sidebar-main">
        <div className="sidebar-main-heading">
          <span>Resume</span>
        </div>
        {sections.map((section) => (
          <SectionRenderer data={data} key={section.id} section={section} variant="sidebar-main" />
        ))}
      </main>
    </div>
  );
}

function NingdeTemplate({ data, sections }: TemplateProps) {
  return (
    <div className="resume-template ningde-template" data-testid={`resume-template-${templateTestIds.ningde}`}>
      <header className="ningde-header">
        <div className="ningde-header-main">
          <h2><StyledText rules={data.keywordStyles} text={data.profile.name || "姓名"} /></h2>
          <p>
            {data.profile.city ? <span>籍贯：<StyledText rules={data.keywordStyles} text={data.profile.city} /></span> : null}
            {data.profile.website ? <span>年龄：<StyledText rules={data.keywordStyles} text={data.profile.website} /></span> : null}
            {data.profile.phone ? <span>电话：<StyledText rules={data.keywordStyles} text={data.profile.phone} /></span> : null}
            {data.profile.email ? <span>邮箱：<StyledText rules={data.keywordStyles} text={data.profile.email} /></span> : null}
          </p>
        </div>
        <ProfilePhoto className="ningde-photo" src={data.profile.photo} />
      </header>

      <div className="ningde-sections">
        {sections.map((section) => (
          <NingdeSection data={data} key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}

function NingdeSection({ data, section }: { data: ResumeData; section: ResumeSectionConfig }) {
  const sectionMap: Record<ResumeSectionId, ReactNode> = {
    summary: data.profile.summary ? <p className="ningde-paragraph"><StyledText rules={data.keywordStyles} text={data.profile.summary} /></p> : null,
    education: (
      <>
        <div className="ningde-table-list">
          {data.education.map((item, index) => (
            <NingdeRow
              key={`${item.school}-${index}`}
              left={`${item.startDate}-${item.endDate}`}
              middle={`${item.school}             ${item.major}`}
              right={item.degree}
              rules={data.keywordStyles}
            />
          ))}
        </div>
        {data.education.flatMap((item) => item.details).filter(Boolean).map((detail, index) => (
          <p className="ningde-paragraph" key={`${detail}-${index}`}><StyledText rules={data.keywordStyles} text={detail} /></p>
        ))}
      </>
    ),
    experience: (
      <>
        {data.experience.map((item, index) => (
          <div className="ningde-entry" key={`${item.company}-${index}`}>
            <NingdeRow left={`${item.startDate}-${item.endDate}`} middle={item.company} right={item.role} rules={data.keywordStyles} />
            <NingdeBullets details={item.details} rules={data.keywordStyles} />
          </div>
        ))}
      </>
    ),
    projects: (
      <>
        {data.projects.map((item, index) => (
          <div className="ningde-entry" key={`${item.name}-${index}`}>
            <NingdeRow left={`${item.startDate}-${item.endDate}`} middle={item.name} right={item.role} rules={data.keywordStyles} />
            <NingdeBullets details={item.details} rules={data.keywordStyles} />
          </div>
        ))}
      </>
    ),
    skills: (
      <div className="ningde-skills">
        {data.skills.map((skill, index) => (
          <p className="ningde-paragraph" key={`${skill.name}-${index}`}>
            <strong><StyledText rules={data.keywordStyles} text={`${skill.name}：`} /></strong>
            <StyledText rules={data.keywordStyles} text={skill.items.join("、")} />
          </p>
        ))}
      </div>
    ),
    awards: (
      <div className="ningde-campus-list">
        {data.awards.map((award, index) => {
          const [date, detail = award.description] = award.description.split("｜");
          return (
            <div className="ningde-campus-item" key={`${award.title}-${index}`}>
              <div className="ningde-campus-heading">
                <strong><StyledText rules={data.keywordStyles} text={date} /></strong>
                <strong><StyledText rules={data.keywordStyles} text={award.title} /></strong>
              </div>
              <NingdeBullets details={[detail]} rules={data.keywordStyles} small />
            </div>
          );
        })}
      </div>
    ),
  };

  const content = sectionMap[section.id];
  if (!content) return null;

  return (
    <section className="ningde-section">
      <h3>{section.title}</h3>
      <div>{content}</div>
    </section>
  );
}

function NingdeRow({ left, middle, right, rules }: { left: string; middle: string; right: string; rules: KeywordStyleRule[] }) {
  return (
    <div className="ningde-row">
      <span><StyledText rules={rules} text={left} /></span>
      <strong><StyledText rules={rules} text={middle} /></strong>
      <strong><StyledText rules={rules} text={right} /></strong>
    </div>
  );
}

function NingdeBullets({ details, rules, small = false }: { details: string[]; rules: KeywordStyleRule[]; small?: boolean }) {
  const filtered = details.filter(Boolean);
  if (!filtered.length) return null;

  return (
    <ul className={small ? "ningde-bullets small" : "ningde-bullets"}>
      {filtered.map((detail, index) => (
        <li key={`${detail}-${index}`}><StyledText rules={rules} text={detail} /></li>
      ))}
    </ul>
  );
}

function SectionRenderer({
  data,
  section,
  variant,
}: {
  data: ResumeData;
  section: ResumeSectionConfig;
  variant: "classic" | "compact" | "sidebar" | "sidebar-main";
}) {
  const timelineVariant = variant === "compact" ? "row" : "default";
  const sectionMap: Record<ResumeSectionId, ReactNode> = {
    summary: <p className="resume-summary"><StyledText rules={data.keywordStyles} text={data.profile.summary} /></p>,
    education: data.education.map((item, index) => (
      <TimelineItem
        details={item.details}
        key={`${item.school}-${index}`}
        meta={`${item.startDate} - ${item.endDate}`}
        rules={data.keywordStyles}
        role={[item.degree, item.major].filter(Boolean).join(" | ")}
        title={item.school}
        variant={timelineVariant}
      />
    )),
    experience: data.experience.map((item, index) => (
      <TimelineItem
        details={item.details}
        key={`${item.company}-${index}`}
        meta={`${item.startDate} - ${item.endDate}`}
        rules={data.keywordStyles}
        role={item.role}
        title={item.company}
        variant={timelineVariant}
      />
    )),
    projects: data.projects.map((item, index) => (
      <TimelineItem
        details={item.details}
        key={`${item.name}-${index}`}
        meta={`${item.startDate} - ${item.endDate}`}
        rules={data.keywordStyles}
        role={item.role}
        title={item.name}
        variant={timelineVariant}
      />
    )),
    skills: (
      <div className="skill-list">
        {data.skills.map((skill, index) => (
          <div className="skill-group" key={`${skill.name}-${index}`}>
            <h4><StyledText rules={data.keywordStyles} text={skill.name} /></h4>
            <p><StyledText rules={data.keywordStyles} text={skill.items.filter(Boolean).join(" / ")} /></p>
          </div>
        ))}
      </div>
    ),
    awards: (
      <div className="award-list">
        {data.awards.map((award, index) => (
          <div className="compact-item" key={`${award.title}-${index}`}>
            <strong><StyledText rules={data.keywordStyles} text={award.title} /></strong>
            <p><StyledText rules={data.keywordStyles} text={award.description} /></p>
          </div>
        ))}
      </div>
    ),
  };

  return (
    <PreviewSection title={section.title} variant={variant}>
      {sectionMap[section.id]}
    </PreviewSection>
  );
}

function PreviewSection({
  children,
  title,
  variant,
}: {
  children: ReactNode;
  title: string;
  variant: "classic" | "compact" | "sidebar" | "sidebar-main";
}) {
  return (
    <section className={`resume-section section-${variant}`}>
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  );
}

function TimelineItem({ details, meta, role, rules, title, variant = "default" }: TimelineItemProps) {
  return (
    <div className={`timeline-item timeline-${variant}`}>
      <div className="timeline-heading">
        <div>
          <h4><StyledText rules={rules} text={title} /></h4>
          {role ? <p><StyledText rules={rules} text={role} /></p> : null}
        </div>
        {meta && meta !== " - " ? <span><StyledText rules={rules} text={meta} /></span> : null}
      </div>
      <ul>
        {details.filter(Boolean).map((detail, index) => (
          <li key={`${detail}-${index}`}><StyledText rules={rules} text={detail} /></li>
        ))}
      </ul>
    </div>
  );
}

function ContactLine({ data }: { data: ResumeData }) {
  return (
    <div className="contact-line">
      <ContactItem icon={<Phone size={12} />} rules={data.keywordStyles} value={data.profile.phone} />
      <ContactItem icon={<Mail size={12} />} rules={data.keywordStyles} value={data.profile.email} />
      <ContactItem icon={<MapPin size={12} />} rules={data.keywordStyles} value={data.profile.city} />
      <ContactItem icon={<LinkIcon size={12} />} rules={data.keywordStyles} value={data.profile.website} />
    </div>
  );
}

function ContactStack({ data }: { data: ResumeData }) {
  return (
    <div className="contact-stack">
      <ContactItem icon={<Phone size={12} />} rules={data.keywordStyles} value={data.profile.phone} />
      <ContactItem icon={<Mail size={12} />} rules={data.keywordStyles} value={data.profile.email} />
      <ContactItem icon={<MapPin size={12} />} rules={data.keywordStyles} value={data.profile.city} />
      <ContactItem icon={<LinkIcon size={12} />} rules={data.keywordStyles} value={data.profile.website} />
    </div>
  );
}

function ContactItem({ icon, rules, value }: { icon: ReactNode; rules: KeywordStyleRule[]; value: string }) {
  if (!value) return null;

  return (
    <span>
      {icon}
      <StyledText rules={rules} text={value} />
    </span>
  );
}

function StyledText({ rules, text }: { rules: KeywordStyleRule[]; text: string }) {
  return tokenizeKeywordStyles(text, rules).map((token, index) => {
    if (!token.rule) return <span key={index}>{token.text}</span>;
    const style = {
      "--keyword-color": token.rule.color,
      "--keyword-font-size": `${token.rule.fontSize}px`,
      "--keyword-font-weight": token.rule.bold ? 800 : "inherit",
    } as CSSProperties;
    return <span className="keyword-highlight" data-keyword={token.rule.keyword} key={index} style={style}>{token.text}</span>;
  });
}

function ProfilePhoto({ className, src }: { className: string; src: string }) {
  if (!src) return null;

  return <img alt="简历照片" className={`resume-photo ${className}`} src={src} />;
}

function getSmartDensity(data: ResumeData) {
  const detailCount =
    data.education.flatMap((item) => item.details).length +
    data.experience.flatMap((item) => item.details).length +
    data.projects.flatMap((item) => item.details).length +
    data.skills.flatMap((item) => item.items).length +
    data.awards.length;
  const textLength = JSON.stringify({
    ...data,
    profile: {
      ...data.profile,
      photo: "",
    },
  }).length;

  if (detailCount > 28 || textLength > 5200) return "tight";
  if (detailCount > 18 || textLength > 3600) return "compact";
  return "normal";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isSameFit(
  current: { scale: number; gapScale: number; blockScale: number; mode: string },
  next: { scale: number; gapScale: number; blockScale: number; mode: string },
) {
  return (
    current.mode === next.mode &&
    Math.abs(current.scale - next.scale) < 0.01 &&
    Math.abs(current.gapScale - next.gapScale) < 0.02 &&
    Math.abs(current.blockScale - next.blockScale) < 0.02
  );
}
