import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Download, FileDown, FileJson, LayoutTemplate, Printer, Save, Upload } from "lucide-react";
import { ResumeEditor } from "./components/editor/ResumeEditor";
import { ResumePreview } from "./components/preview/ResumePreview";
import { TemplateDesigner } from "./components/templates/TemplateDesigner";
import { TemplateManager } from "./components/templates/TemplateManager";
import { useLocalResume } from "./hooks/useLocalResume";
import { useCustomTemplates } from "./hooks/useCustomTemplates";
import type { TemplateSchema, TemplateSelection } from "./types/template";
import { cloneTemplate, createDefaultCustomTemplate, parseTemplate, serializeTemplate } from "./templates/templateSchema";
import { prepareTemplateReference } from "./templates/templateFile";
import { parseResumeImport, serializeResume } from "./utils/resumePersistence";

type BuiltInTemplateSelection = Exclude<TemplateSelection, `custom:${string}`>;

const TEMPLATE_LABELS_STORAGE_KEY = "resume-builder:template-labels";

const templateOptions: Array<{ value: BuiltInTemplateSelection; label: string }> = [
  { value: "classic", label: "参考单栏" },
  { value: "compact", label: "紧凑时间线" },
  { value: "sidebar", label: "现代侧栏" },
  { value: "ningde", label: "宁德时代" },
];

export default function App() {
  const { resume, setResume, saveState, initialError } = useLocalResume();
  const [template, setTemplate] = useState<TemplateSelection>("ningde");
  const [templateLabels, setTemplateLabels] = useState<Record<BuiltInTemplateSelection, string>>(() => loadTemplateLabels(window.localStorage));
  const [notice, setNotice] = useState(initialError ?? "");
  const { error: templateError, remove, templates, upsert } = useCustomTemplates();
  const [templatePanelOpen, setTemplatePanelOpen] = useState(false);
  const [draftTemplate, setDraftTemplate] = useState<TemplateSchema | null>(null);
  const [referenceImage, setReferenceImage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeCustomTemplate = draftTemplate ?? (template.startsWith("custom:") ? templates.find((item) => `custom:${item.id}` === template) ?? null : null);

  useEffect(() => {
    window.localStorage.setItem(TEMPLATE_LABELS_STORAGE_KEY, JSON.stringify(templateLabels));
  }, [templateLabels]);

  const downloadText = (content: string, filename: string) => { const blob = new Blob([content], { type: "application/json;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url); };

  const handleExportJson = () => {
    downloadText(serializeResume(resume), `${resume.profile.name || "resume"}-resume.json`);
    setNotice("JSON 已导出");
  };

  const beginTemplate = (value = createDefaultCustomTemplate()) => { setDraftTemplate(structuredClone(value)); setTemplate(`custom:${value.id}`); setTemplatePanelOpen(false); };
  const saveDraft = async () => { if (!draftTemplate) return; const saved = await upsert(draftTemplate); setDraftTemplate(null); setReferenceImage(""); setTemplate(`custom:${saved.id}`); setNotice("模板已保存到当前浏览器"); };
  const uploadReference = async (file: File) => { try { setNotice("正在读取参考模板"); const image = await prepareTemplateReference(file); setReferenceImage(image); beginTemplate(createDefaultCustomTemplate(file.name.replace(/\.[^.]+$/, ""))); setNotice("参考模板仅在本地打开，请拖拽和调整版式"); } catch (error) { setNotice(error instanceof Error ? error.message : "无法读取参考模板"); } };
  const importTemplate = async (file: File) => { try { const parsed = parseTemplate(await file.text()); beginTemplate(parsed); setNotice("模板已导入，请检查后保存"); } catch { setNotice("模板 JSON 格式无效"); } };

  const handleImportJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      setResume(parseResumeImport(content));
      setNotice("JSON 已导入");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "JSON 导入失败");
    } finally {
      event.target.value = "";
    }
  };

  const handlePrint = async () => {
    setNotice("正在打开打印窗口");
    document.documentElement.classList.add("is-printing-resume");
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    window.print();
  };

  useEffect(() => {
    const clearPrintingState = () => document.documentElement.classList.remove("is-printing-resume");
    window.addEventListener("afterprint", clearPrintingState);
    return () => window.removeEventListener("afterprint", clearPrintingState);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="app-toolbar border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <h1 className="text-xl font-semibold tracking-normal text-slate-950">在线简历编辑器</h1>
            <p className="mt-1 text-sm text-slate-500">{notice || saveState}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-md border border-slate-200 bg-slate-50 p-1">
              {templateOptions.map((option) => (
                <button
                  className={`h-9 rounded px-3 text-sm font-medium transition ${
                    template === option.value
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                  key={option.value}
                  onClick={() => setTemplate(option.value)}
                  type="button"
                >
                  {templateLabels[option.value]}
                </button>
              ))}
            </div>
            <button className={`toolbar-button ${templatePanelOpen ? "active" : ""}`} onClick={() => setTemplatePanelOpen((open) => !open)} type="button"><LayoutTemplate size={16} />我的模板</button>

            <input
              accept="application/json"
              className="hidden"
              onChange={handleImportJson}
              ref={fileInputRef}
              type="file"
            />
            <button
              className="toolbar-button"
              onClick={() => fileInputRef.current?.click()}
              title="导入 JSON"
              type="button"
            >
              <Upload size={16} />
              导入 JSON
            </button>
            <button className="toolbar-button" onClick={handleExportJson} title="导出 JSON" type="button">
              <FileJson size={16} />
              导出 JSON
            </button>
            <button className="toolbar-button" onClick={handlePrint} title="导出 PDF" type="button">
              <FileDown size={16} />
              导出 PDF
            </button>
          </div>
        </div>
      </header>

      {templatePanelOpen ? <div className="template-manager-band"><TemplateManager builtInTemplates={templateOptions.map((option) => ({ ...option, label: templateLabels[option.value] }))} templates={templates} onApply={(value) => { setTemplate(`custom:${value.id}`); setTemplatePanelOpen(false); }} onCreate={() => beginTemplate()} onDelete={async (value) => { await remove(value.id); if (template === `custom:${value.id}`) setTemplate("classic"); }} onDuplicate={async (value) => { const copied = await upsert(cloneTemplate(value)); setTemplate(`custom:${copied.id}`); }} onEdit={beginTemplate} onExport={(value) => downloadText(serializeTemplate(value), `${value.name}-template.json`)} onImport={importTemplate} onReference={uploadReference} onRenameBuiltIn={(value, label) => setTemplateLabels((current) => ({ ...current, [value]: label.trim() || templateOptions.find((option) => option.value === value)!.label }))} onResetBuiltInNames={() => setTemplateLabels(getDefaultTemplateLabels())} /></div> : null}

      {draftTemplate ? <>
        <TemplateDesigner data={resume} onChange={setDraftTemplate} onClose={() => { setDraftTemplate(null); setReferenceImage(""); setTemplate("classic"); }} referenceImage={referenceImage} template={draftTemplate} />
        <button className="designer-save" onClick={() => void saveDraft()} type="button"><Save size={17} />保存模板</button>
      </> : null}

      {!draftTemplate ? <main className="app-shell mx-auto grid max-w-[1440px] gap-5 px-4 py-5 lg:grid-cols-[minmax(380px,480px)_1fr] lg:px-6">
        <section className="editor-pane min-w-0">
          <ResumeEditor resume={resume} setResume={setResume} />
        </section>

        <section className="preview-pane min-w-0">
          <div className="preview-topbar mb-3 flex items-center justify-between text-sm text-slate-500">
            <span>A4 预览 · 智能一页布局</span>
            <button className="icon-button" onClick={handlePrint} title="打印或另存为 PDF" type="button">
              <Printer size={17} />
              <span className="sr-only">打印或另存为 PDF</span>
            </button>
          </div>
          <ResumePreview customTemplate={activeCustomTemplate} data={resume} template={template} />
        </section>
      </main> : null}
      {templateError ? <div className="template-error">{templateError}</div> : null}

      <button className="floating-export" onClick={handlePrint} title="快速保存为 PDF" type="button">
        <Download size={18} />
        <span className="sr-only">快速保存为 PDF</span>
      </button>
    </div>
  );
}

function getDefaultTemplateLabels(): Record<BuiltInTemplateSelection, string> {
  return Object.fromEntries(templateOptions.map((option) => [option.value, option.label])) as Record<BuiltInTemplateSelection, string>;
}

function loadTemplateLabels(storage: Storage): Record<BuiltInTemplateSelection, string> {
  const fallback = getDefaultTemplateLabels();
  try {
    const parsed = JSON.parse(storage.getItem(TEMPLATE_LABELS_STORAGE_KEY) ?? "{}") as Partial<Record<BuiltInTemplateSelection, string>>;
    return {
      classic: typeof parsed.classic === "string" && parsed.classic.trim() ? parsed.classic : fallback.classic,
      compact: typeof parsed.compact === "string" && parsed.compact.trim() ? parsed.compact : fallback.compact,
      sidebar: typeof parsed.sidebar === "string" && parsed.sidebar.trim() ? parsed.sidebar : fallback.sidebar,
      ningde: typeof parsed.ningde === "string" && parsed.ningde.trim() ? parsed.ningde : fallback.ningde,
    };
  } catch {
    return fallback;
  }
}
