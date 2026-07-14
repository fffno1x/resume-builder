import { Copy, Download, FilePlus2, ImageUp, Pencil, Trash2, Upload } from "lucide-react";
import type { ChangeEvent } from "react";
import { useRef } from "react";
import type { TemplateSchema, TemplateSelection } from "../../types/template";

type BuiltInTemplateSelection = Exclude<TemplateSelection, `custom:${string}`>;

type Props = {
  builtInTemplates: Array<{ value: BuiltInTemplateSelection; label: string }>;
  templates: TemplateSchema[];
  onApply: (template: TemplateSchema) => void;
  onCreate: () => void;
  onDelete: (template: TemplateSchema) => void;
  onDuplicate: (template: TemplateSchema) => void;
  onEdit: (template: TemplateSchema) => void;
  onExport: (template: TemplateSchema) => void;
  onImport: (file: File) => void;
  onRenameBuiltIn: (template: BuiltInTemplateSelection, label: string) => void;
  onReference: (file: File) => void;
  onResetBuiltInNames: () => void;
};

export function TemplateManager(props: Props) {
  const referenceRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const pick = (callback: (file: File) => void) => (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) callback(file); event.target.value = ""; };
  return <div className="template-manager">
    <div className="template-manager-actions">
      <button className="toolbar-button" onClick={props.onCreate} type="button"><FilePlus2 size={16} />新建空白模板</button>
      <button className="toolbar-button" onClick={() => referenceRef.current?.click()} type="button"><ImageUp size={16} />上传参考模板</button>
      <button className="toolbar-button" onClick={() => importRef.current?.click()} type="button"><Upload size={16} />导入模板 JSON</button>
      <input accept="application/pdf,image/png,image/jpeg" className="hidden" onChange={pick(props.onReference)} ref={referenceRef} type="file" />
      <input accept="application/json" className="hidden" onChange={pick(props.onImport)} ref={importRef} type="file" />
    </div>
    <div className="built-in-template-names">
      <div className="built-in-template-heading">
        <strong>内置模板名称</strong>
        <button className="toolbar-button compact" onClick={props.onResetBuiltInNames} type="button">恢复默认</button>
      </div>
      <div className="built-in-template-grid">
        {props.builtInTemplates.map((template) => (
          <label key={template.value}>
            <span>{template.value === "classic" ? "参考单栏" : template.value === "compact" ? "紧凑时间线" : template.value === "sidebar" ? "现代侧栏" : "宁德时代"}</span>
            <input maxLength={24} onChange={(event) => props.onRenameBuiltIn(template.value, event.target.value)} value={template.label} />
          </label>
        ))}
      </div>
    </div>
    <div className="template-list">
      {props.templates.length ? props.templates.map((template) => <article className="template-list-item" key={template.id}>
        <button className="template-apply" onClick={() => props.onApply(template)} type="button"><span className="template-swatch" style={{ background: template.page.background }} /><span><strong>{template.name}</strong><small>{new Date(template.createdAt).toLocaleDateString("zh-CN")}</small></span></button>
        <div className="template-item-actions">
          <button className="icon-button" onClick={() => props.onEdit(template)} title="编辑模板" type="button"><Pencil size={14} /></button>
          <button className="icon-button" onClick={() => props.onDuplicate(template)} title="复制模板" type="button"><Copy size={14} /></button>
          <button className="icon-button" onClick={() => props.onExport(template)} title="导出模板 JSON" type="button"><Download size={14} /></button>
          <button className="icon-button danger" onClick={() => props.onDelete(template)} title="删除模板" type="button"><Trash2 size={14} /></button>
        </div>
      </article>) : <div className="template-empty">还没有自定义模板</div>}
    </div>
  </div>;
}
